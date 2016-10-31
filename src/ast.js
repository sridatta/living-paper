import assign from 'lodash/assign'
import camelCase from 'lodash/camelCase'
import fromPairs from 'lodash/fromPairs'

const DEFAULT_RULES = {
  image (token, attrs, children) {
    if (children.length) {
      attrs = assign({}, attrs, { alt: children[0] })
    }
    return [[token.type, attrs]]
  },

  codeInline (token, attrs) {
    return [[token.type, attrs, token.content]]
  },

  codeBlock (token, attrs) {
    return [['pre', [token.type, attrs, token.content]]]
  },

  fence (token, attrs) {
    if (token.info) {
      const langName = token.info.trim().split(/\s+/g)[0]
      attrs = assign({}, attrs, { 'data-language': langName })
    }

    return [['pre', [token.type, attrs, token.content]]]
  },

  hardbreak () {
    return [['br', []]]
  },

  softbreak (token, attrs, children, options) {
    return options.breaks ? [['br', []]] : '\n'
  },

  text (token) {
    return token.content
  },

  htmlBlock (token) {
    return token.content
  },

  htmlInline (token) {
    return token.content
  },

  inline (token, attrs, children) {
    return children
  },

  default (token, attrs, children, options, getNext) {
    if (token.nesting === 1 && token.hidden) {
      return getNext()
    }
    /* plugin-related */
    if (!token.tag) {
      return token.content
    }
    if (token.info) {
      attrs = assign({}, attrs, { 'data-info': token.info.trim() })
    }
    /* plugin-related */
    return [[token.type, attrs].concat((token.nesting === 1) && getNext())]
  }
}

let convertRules = DEFAULT_RULES

function indent (treeStr) {
  return treeStr.split('\n').map(l => '  ' + l).join('\n')
}

export function lispifyTree (tree) {
  if (!tree) {
    return ''
  }

  if (!Array.isArray(tree)) {
    return tree
  }

  let children = tree.slice(2).map(x => indent(lispifyTree(x))).join('\n')
  if (tree.length > 3) {
    children = '\n' + children
  }
  return '(' + tree[0] + ' ' + JSON.stringify(tree[1] || {}) + children + ')'
}

export function convertTree (tokens, options) {
  function convertBranch (tkns, nested) {
    let branch = []

    if (!nested) {
      branch.push('doc')
      branch.push({})
    }

    function getNext () {
      return convertBranch(tkns, true)
    }

    let token = tkns.shift()
    while (token && token.nesting !== -1) {
      const attrs = token.attrs && fromPairs(token.attrs)
      const children = token.children && convertBranch(token.children.slice(), true)
      const rule = convertRules[camelCase(token.type)] || convertRules.default

      branch = branch.concat(
        rule(token, attrs, children, options, getNext)
      )
      token = tkns.shift()
    }
    return branch
  }

  return convertBranch(tokens, false)
}
