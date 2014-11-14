import uncontext.*;

Uncontext unctx;

float fadeValue = 0;
float hue = 0;
float radius = 10;
float xPosition = 0;
float yPosition = 0;
float spread = 0;

void setup(){
  size(800, 600, P3D);
  
  unctx = new Uncontext(this, "literature");
  
  colorMode(HSB, 26);
  background(0);  
  noStroke();
  xPosition = width / 2;
}

void draw() {
  fill(0,0,0, fadeValue * 0.05);
  rect(0, 0, width, height);
  
  fill(hue, 255, 255);
  ellipse(xPosition, yPosition, radius, radius);
  xPosition += (random(spread) - (spread / 2)) * 0.75;
  yPosition += 1;
  if(xPosition >= width){
    xPosition = 0;
  } else if(xPosition < 0){
    xPosition = width - 1;
  }
  if(yPosition >= height){
    yPosition = 0;
  }
}

void uncontext(int a, float b, int c, int d, int f, int g) {
  fadeValue = b;
  hue = a;
  radius = d * 10;
  if(c == 1){
    radius *= 2;
  }
  spread = f;
}
