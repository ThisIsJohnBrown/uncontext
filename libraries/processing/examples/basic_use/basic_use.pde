import uncontext.*;

Uncontext unctx;

void setup() {
  
  // To see all available streams, use Uncontext.list()
  Uncontext.list();
  
  // Connect to the 'literature' stream
  unctx = new Uncontext(this, "literature");
}

void uncontext(int a, float b, int c, int d, int f, int g) {
  println("literature: " + a + ", " + b + ", " + c + ", " + d + ", " + f + ", " + g);
}
