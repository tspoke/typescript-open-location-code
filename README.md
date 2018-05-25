# About

This is the TypeScript implementation of the Open Location Code ported from the JS version :

https://github.com/google/open-location-code/tree/master/js

# Usage

Same usage as the Javascript version :

```
OpenLocationCode.encode(LATITUDE, LONGITUDE);
OpenLocationCode.encode(LATITUDE, LONGITUDE, PRECISION);
OpenLocationCode.decode("8CVXFFF4+W7")
OpenLocationCode.recoverNearest(SHORT_CODE, LATITUDE, LONGITUDE)
```

For more examples, please refer to the JS repository.