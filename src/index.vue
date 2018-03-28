<template>
    <section>
        <p>johnさんの言葉: {{greeting}}</p>
    </section>
</template>

<script>
  module.exports = {
    data: function() {
      return {
        greeting: 'こんにちは',
      }
    }
  }
</script>

<style scoped>
  p {
    font-size: 2em;
    text-align: center;
    color: #2e9afe;
  }
</style>