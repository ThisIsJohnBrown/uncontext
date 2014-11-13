package uncontext;

import java.lang.reflect.*;
import processing.core.*;
import processing.data.JSONObject;
import processing.data.JSONArray;

public enum Streams {

	LITERATURE 	{
		@Override
		public String getName() {
			return "literature";
		}

		@Override
		public Class[] getMethodParameters() {
			return new Class[] { int.class, float.class, int.class, int.class, int.class, int.class };
		}

		@Override
		public String getSignatureExample() {
			return "uncontext(int a, float b, int c, int d, int f, int g) { }";
		}

		@Override
	  	public Object[] getMethodValues( JSONObject data ){
	   		Object[] values = new Object[6];
			
			values[0] = data.getInt("a");
			values[1] = data.getFloat("b");
			values[2] = data.getInt("c");
			values[3] = data.getInt("d");

			JSONObject e = data.getJSONObject("e");

			values[4] = e.getInt("f");
			values[5] = e.getInt("g");
			
			return values;
	   	}
	},

	DUEL 	{
		@Override
		public String getName() {
			return "duel";
		}

		@Override
		public Class[] getMethodParameters() {
			return new Class[] { float[].class, float[].class, float.class, float.class, float.class, float.class };
		}

		@Override
		public String getSignatureExample() {
			return "uncontext(float[] a, float[] b, float c, float d, float e, float f) { }";
		}

		@Override
	  	public Object[] getMethodValues( JSONObject data ){
	   		Object[] values = new Object[6];
	   		
	   		JSONArray a = data.getJSONArray("a");
			JSONArray b = data.getJSONArray("b");

			values[0] = new float[] { a.getFloat(0), a.getFloat(1) };
			values[1] = new float[] { b.getFloat(0), b.getFloat(1) };
			values[2] = data.getFloat("c");
			values[3] = data.getFloat("d");
			values[4] = data.getFloat("e");
			values[5] = data.getFloat("f");
			
			return values;
	   	}
	};

	public abstract String getName();
	public abstract Class[] getMethodParameters();
	public abstract String getSignatureExample();
   	public abstract Object[] getMethodValues( JSONObject data );

	private Streams() {
	}
}