class Circle {
  constructor({x = 0, y = 0, r}) {
    this.x = x;
    this.y = y;
    this.r = r;
  }
  setCenter({width, height}) {
    this.x = width/ 2;
    this.y = height/ 2;
    this.r = Math.min(width, height) / 2;
  }
  get getCircumscribed() {
    return new Rect({
      x: this.x - this.r,
      y: this.y - this.r,
      width: this.r * 2,
      height: this.r * 2
    });
  }
  get copy() {
    return new Circle(this);
  }
}

class InTheRectCircle {
  constructor({circle, rect}) {
    this.circle = new Circle(circle);
    this.rect = new Rect(rect);
  }

  cropX(delta) {
    const rect = this.circle.getCircumscribed;
    if (rect.x + delta < this.rect.x) {
      return this.rect.x + this.circle.r;
    } else if (rect.x + rect.width + delta > this.rect.x + this.rect.width) {
      return this.rect.x + this.rect.width - this.circle.r;
    }
    return this.circle.x + delta;
  }

  cropY(delta) {
    const rect = this.circle.getCircumscribed;
    if (rect.y + delta < this.rect.y) {
      return this.rect.y + this.circle.r;
    } else if (rect.y + rect.height + delta > this.rect.y + this.rect.height) {
      return this.rect.y + this.rect.height - this.circle.r;
    }
    return this.circle.y + delta;
  }

  cropR(scale) {
    const c = this.circle.copy;
    c.r *= scale;
    if (this.rect.width < c.r * 2) {
      return this.rect.width / 2;
    } else if (this.rect.height < c.r * 2) {
      return this.rect.height / 2;
    }
    return c.r;
  }
}

class Rect {
  constructor({x = 0, y = 0, width = 0, height = 0}) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
  setSize({width, height}) {
    this.width = width;
    this.height = height;
  }
}

module.exports = {
  Circle,
  Rect,
  InTheRectCircle
};