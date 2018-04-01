<template>
    <section>
        <input type="file" @change="load($event.target.files)">
        <button @click="getImage">画像を見る</button>
        <canvas id="c1" v-show="!!loadedImage" :width="size.width" :height="size.height" @click="draw($event)"></canvas>
        <!--cropに使うcanvasを別に作成する-->
        <canvas id="_crop_canvas" v-show="false" :width="size.width" :height="size.height"></canvas>
        <canvas id="_destination_canvas" v-show="false"></canvas>

        <img :src="dataUrl">
    </section>
</template>

<script>
  import Vue from 'vue';
  module.exports = {
    data: function() {
      return {
        greeting: 'こんにちは',
        imageContext: null,
        loadedImage: null,
        size: {
          width: 1024,
          height: 1024
        },
        dataUrl: '',
        circle: {
          x: 0,
          y: 0,
          width: 100,
          height: 100
        }
      }
    },
    mounted() {
      this.imageContext = this.$el.querySelector('#c1').getContext('2d');
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
            this.size.width = image.width;
            this.size.height = image.height;
            this.loadedImage = image;
            Vue.nextTick(() => {
              this.draw(); // renderという単語がvueの内部で使われておりclick時とかぶってしまう
            });
          }
          image.src = evt.target.result;
        }
        reader.readAsDataURL(files[0]);
      },
      draw(event) {
        if (!this.loadedImage) {
          return;
        }
        this.imageContext.clearRect(0,0,this.size.width,this.size.height);
        this.imageContext.drawImage(this.loadedImage, 0, 0);
        if (event) {
          const rect = event.target.getBoundingClientRect();
          this.circle.x = (event.clientX - rect.left) * (this.size.width/ rect.width); // 比率をかける,
          this.circle.y = (event.clientY - rect.top) * (this.size.height/ rect.height); // 比率をかける
        } else {
          this.circle.x = this.size.width/ 2;
          this.circle.y = this.size.height/ 2;
        }
        this.renderCrop(this.circle.x, this.circle.y);
      },
      renderCrop(x, y) {
        const canvas = this.$el.querySelector('#_crop_canvas');
        const context = canvas.getContext('2d');
        context.clearRect(0,0,this.size.width,this.size.height);
        context.globalCompositeOperation = 'source-over';
        context.fillStyle = '#00000044';
        context.rect(0,0,this.size.width,this.size.height);
        context.fill();
        context.globalCompositeOperation = 'destination-out';
        context.beginPath();
        context.arc(x, y, this.circle.width, 0, Math.PI*2, false);
        context.fillStyle = '#000000FF'; // ブレンドするので、ブレンド度合いのalpha値をmaxにしないと完全にclip出来ない
        context.fill();
        context.globalCompositeOperation = 'source-over';
        // contextではなくcanvas要素を指定しないといけない
        this.imageContext.drawImage(canvas, 0, 0);
      },
      getImage() {
        if (!this.loadedImage) {
          return;
        }
        const canvas = this.$el.querySelector('#_destination_canvas');
        const context = canvas.getContext('2d');
        const rectWidth = this.circle.width * 2;
        const rectHeight = this.circle.height * 2;
        canvas.width = rectWidth;
        canvas.height = rectHeight;
        context.clearRect(0,0,rectWidth,rectHeight);
        context.fillStyle = '#000000FF';
        // http://www.html5.jp/canvas/ref/method/drawImage.html
        context.drawImage(this.loadedImage,
          this.circle.x - this.circle.width,
          this.circle.y - this.circle.height,
          rectWidth,
          rectHeight,
          0,
          0,
          rectWidth,
          rectHeight
        );
        this.dataUrl = canvas.toDataURL();
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