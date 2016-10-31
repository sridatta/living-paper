<template>
	<div class="hello">
    <h1>Living Paper</h1>
    <h2>Raw Markdown</h2>
    <textarea v-model="markdownInput"></textarea>
    <h2>AST</h2>
    <code>
    <pre>
{{lispify(tree)}}
    </pre>
    </code>
</template>

<script>
import Vue from 'vue'

import {lispifyTree, convertTree} from '../ast'

import markdown from 'markdown-it'

import {EditorState} from 'prosemirror-state'
import {EditorView} from 'prosemirror-view'
import {schema} from 'prosemirror-schema-basic'
import {keymap} from 'prosemirror-keymap'
import {baseKeymap} from 'prosemirror-commands'

const markdownInput = `## Typographic replacements

Enable *typographer* **option** to see result.

[Link](http://google.com)
`

const md = markdown()

let Hello = Vue.component('hello', {
  data: function () {
    return {
      markdownInput: markdownInput
    }
  },
  mounted () {
    var element = document.querySelector('#editor')
    var editorView = new EditorView(element, {
      state: EditorState.create({schema, plugins: [keymap(baseKeymap)]}),
      onAction: function (action) {
        editorView.updateState(editorView.state.applyAction(action))
      }
    })
    this.editorView = editorView
  },
  computed: {
    parsedTokens () {
      return md.parse(this.markdownInput, {})
    },
    tree () {
      return convertTree(this.parsedTokens.slice(), {})
    }
  },
  methods: {
    lispify (tree) {
      return lispifyTree(tree)
    }
  }
})

Hello.staticMethod = function () {
  return new this()
}

export default Hello
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  textarea {
    min-height: 200px;
    width: 500px;
  }
	h1,
	h2 {
		font-weight: normal;
	}
	
	ul {
		list-style-type: none;
		padding: 0;
	}
	
	li {
		margin: 0 10px;
	}
	
	a {
		color: #42b983;
	}
</style>