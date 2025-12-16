<template>
  <div
    class="w-4/5 min-h-full mx-auto bg-white p-5 shadow-lg moz-reader-content"
    v-html="content"
  ></div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    content: string
  }>(),
  {
    content: ''
  }
)
</script>

<style>
@media print {
  .moz-reader-content p,
  .moz-reader-content code,
  .moz-reader-content pre,
  .moz-reader-content blockquote,
  .moz-reader-content ul,
  .moz-reader-content ol,
  .moz-reader-content li,
  .moz-reader-content figure,
  .moz-reader-content .wp-caption {
    margin: 0 0 10px !important;
    padding: 0 !important;
  }
}

.moz-reader-content {
  font-size: 1em;

  --main-background: var(--light-theme-background);
  --main-foreground: var(--light-theme-foreground);
  --primary-color: rgb(0 97 224);
  --toolbar-border: var(--grey-90-a20);
  --toolbar-transparent-border: transparent;
  --toolbar-box-shadow: var(--grey-90-a10);
  --toolbar-button-background: transparent;
  --toolbar-button-background-hover: rgb(207 207 216 / 66%);
  --toolbar-button-foreground-hover: var(--icon-fill);
  --toolbar-button-background-active: rgb(207 207 216);
  --toolbar-button-foreground-active: var(--primary-color);
  --toolbar-button-border: transparent;
  --toolbar-button-border-hover: var(--toolbar-button-border);
  --toolbar-button-border-active: var(--toolbar-button-border);
  --tooltip-background: var(--toolbar-button-background-active);
  --tooltip-foreground: var(--icon-fill);
  --tooltip-border: transparent;
  --popup-background: #fff;
  --popup-border: rgb(0 0 0 / 12%);
  --opaque-popup-border: rgb(224 224 224);
  --popup-line: var(--grey-30);
  --popup-shadow: rgb(49 49 49 / 30%);
  --popup-button-background: rgb(207 207 216 / 33%);
  --popup-button-foreground: var(--main-foreground);
  --popup-button-background-hover: var(--toolbar-button-background-hover);
  --popup-button-foreground-hover: var(--main-foreground);
  --popup-button-background-active: var(--toolbar-button-background-active);
  --popup-button-border: var(--popup-border);
  --selected-background: rgb(0 97 224 / 30%);
  --selected-border: var(--primary-color);
  --outline-focus-color: var(--primary-color);
  --font-value-background: rgb(240 240 244);
  --font-value-border: var(--grey-30);
  --icon-fill: rgb(91 91 102);
  --icon-disabled-fill: rgb(91 91 102 / 40%);
  --text-selected-background: var(--selected-background);
  --text-selected-foreground: inherit;
  --link-foreground: var(--primary-color);
  --link-selected-background: var(--selected-background);
  --link-selected-foreground: #333;
  --visited-link-foreground: #b5007f;
}

.moz-reader-content h1,
.moz-reader-content h2,
.moz-reader-content h3 {
  font-weight: bold;
}

.moz-reader-content h1 {
  font-size: 1.6em;
  line-height: 1.25em;
}

.moz-reader-content h2 {
  font-size: 1.2em;
  line-height: 1.51em;
}

.moz-reader-content h3 {
  font-size: 1em;
  line-height: 1.66em;
}

.moz-reader-content a:link {
  text-decoration: underline;
  font-weight: normal;
}

.moz-reader-content a:link,
.moz-reader-content a:link:hover,
.moz-reader-content a:link:active {
  color: var(--link-foreground);
}

.moz-reader-content a:visited {
  color: var(--visited-link-foreground);
}

.moz-reader-content * {
  max-width: 100%;
  height: auto;
}

.moz-reader-content p,
.moz-reader-content p,
.moz-reader-content code,
.moz-reader-content pre,
.moz-reader-content blockquote,
.moz-reader-content ul,
.moz-reader-content ol,
.moz-reader-content li,
.moz-reader-content figure,
.moz-reader-content .wp-caption {
  margin: -10px -10px calc(8px + var(--line-height) * 0.4);
  padding: 10px;
  border-radius: 5px;
}

.moz-reader-content li {
  margin-bottom: 0;
}

.moz-reader-content li > ul,
.moz-reader-content li > ol {
  margin-bottom: -10px;
}

.moz-reader-content p > img:only-child,
.moz-reader-content p > a:only-child > img:only-child,
.moz-reader-content .wp-caption img,
.moz-reader-content figure img {
  display: block;
}

.moz-reader-content img[moz-reader-center] {
  margin-inline: auto;
}

/* Align non-centered images with the text. Margins are unset unless the user makes a text alignment selection. */

/* Does not use logical properties because the margins are tied to text alignment and not text direction. */
.moz-reader-content img:not([moz-reader-center]) {
  margin-left: var(--block-img-margin-left);
  margin-right: var(--block-img-margin-right);
}

.moz-reader-content .caption,
.moz-reader-content .wp-caption-text .moz-reader-content figcaption {
  font-size: 0.9em;
  line-height: 1.48em;
  font-style: italic;
}

.moz-reader-content pre {
  white-space: pre-wrap;
}

.moz-reader-content blockquote {
  padding: 0;
  padding-inline-start: 16px;
}

.moz-reader-content ul,
.moz-reader-content ol {
  padding: 0;
}

.moz-reader-content ul {
  padding-inline-start: 30px;
  list-style: disc;
}

.moz-reader-content ol {
  padding-inline-start: 30px;
}

.moz-reader-content table,
.moz-reader-content th,
.moz-reader-content td {
  border: 1px solid currentcolor;
  border-collapse: collapse;
  padding: 6px;
  vertical-align: top;
}

.moz-reader-content table {
  margin: 5px;
}

/* Visually hide (but don't display: none) screen reader elements */
.moz-reader-content .visually-hidden,
.moz-reader-content .visuallyhidden,
.moz-reader-content .sr-only {
  display: inline-block;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  border-width: 0;
}

/* Hide elements with common "hidden" class names */
.moz-reader-content .hidden,
.moz-reader-content .invisible {
  display: none;
}

/* Enforce wordpress and similar emoji/smileys aren't sized to be full-width,
 * see bug 1399616 for context. */
.moz-reader-content img.wp-smiley,
.moz-reader-content img.emoji {
  display: inline-block;
  border-width: 0;

  /* height: auto is implied from `.moz-reader-content *` rule. */
  width: 1em;
  margin: 0 0.07em;
  padding: 0;
}

.reader-show-element {
  display: initial;
}

/* Provide extra spacing for images that may be aided with accompanying element such as <figcaption> */
.moz-reader-block-img:not(:last-child) {
  margin-block-end: 12px;
}

.moz-reader-wide-table {
  overflow-x: auto;
  display: block;
}

.moz-reader-content pre code {
  background-color: var(--main-background);
  border: 1px solid var(--main-foreground);
  display: block;
  overflow: auto;
}
</style>
