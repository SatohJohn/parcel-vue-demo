<template>
    <section>
        <input type="file" @change="load($event.target.files)">
        <canvas id="c1" :width="size.width" :height="size.height"></canvas>
    </section>
</template>

<script>
  import Vue from 'vue';
  module.exports = {
    data: function() {
      return {
        greeting: 'こんにちは',
        context: null,
        size: {
          width: 1024,
          height: 1024
        }
      }
    },
    mounted() {
      const canvas = this.$el.querySelector('#c1');
      this.context = canvas.getContext('2d');
    },
    methods: {
      load(files) {
        if (!files[0]) {
          return;
        }
        const image = new Image();
        const reader = new FileReader();
        reader.onload = (evt) => {
          image.onload = () => {
            // 貼り付けたい位置とその大きさ
            // this.context.drawImage(image, 0, 0, this.size.witdh, this.size.height);
            // this.context.drawImage(image, this.size.witdh, this.size.height);
            this.size.width = image.width;
            this.size.height = image.height;
            Vue.nextTick(() => {
              this.render(image);
            })
          }
          image.src = evt.target.result;
        }
        reader.readAsDataURL(files[0]);
      },
      render(image) {
        this.context.drawImage(image, 0, 0);
        // this.context.fillStyle = '#cccc00';
        // this.context.beginPath();
        // this.context.fill();
        // this.context.arc(0, 0, this.size.width/2, 0, Math.PI*2, true);
      }
    }
  }
</script>

<style scoped>
  canvas {
    width: 100%;
    display: block;
  }
</style>