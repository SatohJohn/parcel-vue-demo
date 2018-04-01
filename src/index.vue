<template>
    <section>
        <input type="file" @change="load($event.target.files)">
        <button @click="crop">トリミングする</button>
        <v-touch @pinchstart="pinchStart($event)" @pinchmove="pinchmove($event)" @panstart="moveStart($event)" @panmove="move($event)">
          <canvas id="c1" v-show="!!loadedImage" :width="canvas.width" :height="canvas.height"></canvas>
        </v-touch>
        <!--cropに使うcanvasを別に作成する-->
        <canvas id="_crop_canvas" v-show="false" :width="canvas.width" :height="canvas.height"></canvas>
        <canvas id="_destination_canvas" v-show="false"></canvas>

        <img :src="dataUrl">
        <div>{{message}}</div>
    </section>
</template>

<script>
  import Vue from 'vue';
  import {Circle, Rect, InTheRectCircle} from './data.js';

  module.exports = {
    data: function() {
      return {
        imageContext: null,
        loadedImage: null,
        canvas: new Rect({
          width: 1024,
          height: 1024
        }),
        dataUrl: '',
        cropArea: new Circle({
          r: 1024/2
        }),
        inTheRectCircle: null,
        ratio: {
          x: 1.0,
          y: 1.0
        },
        message: ''
      }
    },
    mounted() {
      const canvas = this.$el.querySelector('#c1');
      this.imageContext = canvas.getContext('2d');
      let timer = null;
      window.addEventListener('resize', event => {
        if (timer !== false) {
          clearTimeout(timer);
        }
        timer = setTimeout(() => {
          this.calcRatio();
        }, 500);
      });
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
            this.canvas.setSize(image);
            this.loadedImage = image;
            this.cropArea.setCenter(this.canvas);
            Vue.nextTick(() => {
              this.calcRatio();
              this.render();
            });
          }
          image.src = evt.target.result;
        }
        reader.readAsDataURL(files[0]);
      },
      calcRatio() {
        const canvas = this.$el.querySelector('#c1');
        const rect = canvas.getBoundingClientRect();
        this.ratio.x = this.canvas.width/ rect.width; // 比率をかける,
        this.ratio.y = this.canvas.height/ rect.height; // 比率をかける
      },
      render() {
        if (!this.loadedImage) {
          return;
        }
        this.imageContext.clearRect(0,0,this.canvas.width,this.canvas.height);
        this.imageContext.drawImage(this.loadedImage, 0, 0);
        this.renderCrop();
      },
      renderCrop(x, y) {
        const canvas = this.$el.querySelector('#_crop_canvas');
        const context = canvas.getContext('2d');
        context.clearRect(0,0,this.canvas.width,this.canvas.height);
        context.globalCompositeOperation = 'source-over';
        context.fillStyle = '#00000044';
        context.rect(0,0,this.canvas.width,this.canvas.height);
        context.fill();
        context.globalCompositeOperation = 'destination-out';
        context.beginPath();
        context.arc(this.cropArea.x, this.cropArea.y, this.cropArea.r, 0, Math.PI*2, false);
        context.fillStyle = '#000000FF'; // ブレンドするので、ブレンド度合いのalpha値をmaxにしないと完全にclip出来ない
        context.fill();
        context.globalCompositeOperation = 'source-over';
        // contextではなくcanvas要素を指定しないといけない
        this.imageContext.drawImage(canvas, 0, 0);
      },
      pinchStart(event) {
        this.inTheRectCircle = new InTheRectCircle({
          rect: this.canvas,
          circle: this.cropArea
        });
        this.render();
      },
      moveStart(event) {
        const canvas = this.$el.querySelector('#c1');
        const rect = canvas.getBoundingClientRect();
        this.inTheRectCircle = new InTheRectCircle({
          rect: this.canvas,
          circle: new Circle({
            x: (event.center.x - rect.left) * this.ratio.x,
            y: (event.center.y - rect.top) * this.ratio.y,
            r: this.cropArea.r
          })
        });
        this.render();
      },
      move(event) {
        this.cropArea.x = this.inTheRectCircle.cropX(event.deltaX * this.ratio.x);
        this.cropArea.y = this.inTheRectCircle.cropY(event.deltaY * this.ratio.y);
        this.render();
      },
      pinchmove(event) {
        this.message = (event)
        // this.inTheRectCircle.circle.r *= event.scale;
        this.cropArea.r = this.inTheRectCircle.cropR(event.scale);
        this.cropArea.x = this.inTheRectCircle.cropX(event.deltaX * this.ratio.x);
        this.cropArea.y = this.inTheRectCircle.cropY(event.deltaY * this.ratio.y);
        this.render();
      },
      crop() {
        if (!this.loadedImage) {
          return;
        }
        const canvas = this.$el.querySelector('#_destination_canvas');
        const context = canvas.getContext('2d');
        const circumscribed = this.cropArea.getCircumscribed;
        canvas.width = circumscribed.width;
        canvas.height = circumscribed.height;
        context.clearRect(0,0,circumscribed.width,circumscribed.height);
        context.fillStyle = '#000000FF';
        // http://www.html5.jp/canvas/ref/method/drawImage.html
        context.drawImage(this.loadedImage,
          circumscribed.x,
          circumscribed.y,
          circumscribed.width,
          circumscribed.height,
          0,
          0,
          canvas.width,
          canvas.height
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