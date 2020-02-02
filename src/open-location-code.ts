const LATITUDE_MAX = 90;
const LONGITUDE_MAX = 180;

/**
 * Coordinates of a decoded Open Location Code.
 *
 * The coordinates include the latitude and longitude of the lower left and
 * upper right corners and the center of the bounding box for the area the
 * code represents.
 *
 * @constructor
 */
export class CodeArea {
  /**
   * The latitude of the center in degrees.
   */
  public latitudeCenter: number;
  /**
   * The longitude of the center in degrees.
   */
  public longitudeCenter: number;

  constructor(public latitudeLo, public longitudeLo, public latitudeHi, public longitudeHi, public codeLength) {
    this.latitudeCenter = Math.min(latitudeLo + (latitudeHi - latitudeLo) / 2, LATITUDE_MAX);
    this.longitudeCenter = Math.min(longitudeLo + (longitudeHi - longitudeLo) / 2, LONGITUDE_MAX);
  }

  public getLatitudeHeight(): number {
    return this.latitudeHi - this.latitudeLo;
  }

  public getLongitudeWidth(): number {
    return this.longitudeHi - this.longitudeLo;
  }
}

/**
 * Open Location Code implementation for TypeScript
 */
export default class OpenLocationCode {

  public constructor(public code: string) {
  }

  public getCode(): string {
    return this.code;
  }

  /**
   * Returns whether this {@link OpenLocationCode} is a padded Open Location Code, meaning that it
   * contains less than 8 valid digits.
   */
  public isPadded(): boolean {
    return this.code.indexOf(OpenLocationCode.PADDING_CHARACTER_) >= 0;
  }

  private static readonly CODE_PRECISION_NORMAL = 10;
  private static readonly CODE_PRECISION_EXTRA = 11;
  private static readonly MAX_DIGIT_COUNT_ = 15;

  // A separator used to break the code into two parts to aid memorability.
  private static readonly SEPARATOR_ = "+";

  // The number of characters to place before the separator.
  private static readonly SEPARATOR_POSITION_ = 8;

  // The character used to pad codes.
  private static readonly PADDING_CHARACTER_ = "0";

  // The character set used to encode the values.
  private static readonly CODE_ALPHABET_ = "23456789CFGHJMPQRVWX";

  // The base to use to convert numbers to/from.
  private static readonly ENCODING_BASE_ = OpenLocationCode.CODE_ALPHABET_.length;

  // The maximum value for latitude in degrees.
  static readonly LATITUDE_MAX_ = LATITUDE_MAX;

  // The maximum value for longitude in degrees.
  static readonly LONGITUDE_MAX_ = LONGITUDE_MAX;

  // Maximum code length using lat/lng pair encoding. The area of such a
  // code is approximately 13x13 meters (at the equator), and should be suitable
  // for identifying buildings. This excludes prefix and separator characters.
  private static readonly PAIR_CODE_LENGTH_ = 10;

  // The resolution values in degrees for each position in the lat/lng pair
  // encoding. These give the place value of each position, and therefore the
  // dimensions of the resulting area.
  private static readonly PAIR_RESOLUTIONS_ = [20.0, 1.0, .05, .0025, .000125];

  // First place value of the pairs (if the last pair value is 1).
  private static readonly PAIR_FIRST_PLACE_VALUE_ = Math.pow(OpenLocationCode.ENCODING_BASE_, (OpenLocationCode.PAIR_CODE_LENGTH_ / 2 - 1));

  // Inverse of the precision of the pair section of the code.
  private static readonly PAIR_PRECISION_ = Math.pow(OpenLocationCode.ENCODING_BASE_, 3);

  // Number of digits in the grid precision part of the code.
  private static readonly GRID_CODE_LENGTH_ = OpenLocationCode.MAX_DIGIT_COUNT_ - OpenLocationCode.PAIR_CODE_LENGTH_;

  // Number of columns in the grid refinement method.
  private static readonly GRID_COLUMNS_ = 4;

  // Number of rows in the grid refinement method.
  private static readonly GRID_ROWS_ = 5;

  // First place value of the latitude grid (if the last place is 1).
  private static readonly GRID_LAT_FIRST_PLACE_VALUE_ = Math.pow(OpenLocationCode.GRID_ROWS_, (OpenLocationCode.GRID_CODE_LENGTH_ - 1));

  // First place value of the longitude grid (if the last place is 1).
  private static readonly GRID_LNG_FIRST_PLACE_VALUE_ = Math.pow(OpenLocationCode.GRID_COLUMNS_, (OpenLocationCode.GRID_CODE_LENGTH_ - 1));

  // Multiply latitude by this much to make it a multiple of the finest
  // precision.
  private static readonly FINAL_LAT_PRECISION_ = OpenLocationCode.PAIR_PRECISION_ *
      Math.pow(OpenLocationCode.GRID_ROWS_, (OpenLocationCode.MAX_DIGIT_COUNT_ - OpenLocationCode.PAIR_CODE_LENGTH_));

  // Multiply longitude by this much to make it a multiple of the finest
  // precision.
  private static readonly FINAL_LNG_PRECISION_ = OpenLocationCode.PAIR_PRECISION_ *
      Math.pow(OpenLocationCode.GRID_COLUMNS_, (OpenLocationCode.MAX_DIGIT_COUNT_ - OpenLocationCode.PAIR_CODE_LENGTH_));

  // Minimum length of a code that can be shortened.
  private static readonly MIN_TRIMMABLE_CODE_LEN_ = 6;


  /**
   * Determines if a code is valid.
   *
   * To be valid, all characters must be from the Open Location Code character
   * set with at most one separator. The separator can be in any even-numbered
   * position up to the eighth digit.
   *
   * @param {string} code The string to check.
   * @return {boolean} True if the string is a valid code.
   */
  public static isValid(code: string): boolean {
    if (!code) {
      return false;
    }
    // The separator is required.
    if (code.indexOf(OpenLocationCode.SEPARATOR_) === -1) {
      return false;
    }
    if (code.indexOf(OpenLocationCode.SEPARATOR_) !== code.lastIndexOf(OpenLocationCode.SEPARATOR_)) {
      return false;
    }
    // Is it the only character?
    if (code.length === 1) {
      return false;
    }
    // Is it in an illegal position?
    if (code.indexOf(OpenLocationCode.SEPARATOR_) > OpenLocationCode.SEPARATOR_POSITION_ ||
      code.indexOf(OpenLocationCode.SEPARATOR_) % 2 === 1) {
      return false;
    }
    // We can have an even number of padding characters before the separator,
    // but then it must be the final character.
    if (code.indexOf(OpenLocationCode.PADDING_CHARACTER_) > -1) {
      // Short codes cannot have padding
      if (code.indexOf(OpenLocationCode.SEPARATOR_) < OpenLocationCode.SEPARATOR_POSITION_) {
        return false;
      }
      // Not allowed to start with them!
      if (code.indexOf(OpenLocationCode.PADDING_CHARACTER_) === 0) {
        return false;
      }
      // There can only be one group and it must have even length.
      const padMatch = code.match(new RegExp("(" + OpenLocationCode.PADDING_CHARACTER_ + "+)", "g"));
      if (padMatch.length > 1 || padMatch[0].length % 2 === 1 ||
        padMatch[0].length > OpenLocationCode.SEPARATOR_POSITION_ - 2) {
        return false;
      }
      // If the code is long enough to end with a separator, make sure it does.
      if (code.charAt(code.length - 1) !== OpenLocationCode.SEPARATOR_) {
        return false;
      }
    }
    // If there are characters after the separator, make sure there isn't just
    // one of them (not legal).
    if (code.length - code.indexOf(OpenLocationCode.SEPARATOR_) - 1 === 1) {
      return false;
    }

    // Strip the separator and any padding characters.
    const strippedCode = code.replace(new RegExp("\\" + OpenLocationCode.SEPARATOR_ + "+"), "")
      .replace(new RegExp(OpenLocationCode.PADDING_CHARACTER_ + "+"), "");
    // Check the code contains only valid characters.
    for (let i = 0, len = strippedCode.length; i < len; i++) {
      const character = strippedCode.charAt(i).toUpperCase();
      if (character !== OpenLocationCode.SEPARATOR_ && OpenLocationCode.CODE_ALPHABET_.indexOf(character) === -1) {
        return false;
      }
    }
    return true;
  };

  /**
   * Returns whether the provided Open Location Code is a padded Open Location Code, meaning that it
   * contains less than 8 valid digits.
   */
  public static isPadded(code: string): boolean {
    return new OpenLocationCode(code).isPadded();
  }

  /**
   * Determines if a code is a valid short code.
   *
   * @param {string} code The string to check.
   * @return {boolean} True if the string can be produced by removing four or
   *     more characters from the start of a valid code.
   */
  public static isShort(code: string): boolean {
    if (!OpenLocationCode.isValid(code)) {
      return false;
    }
    // If there are less characters than expected before the SEPARATOR.
    return code.indexOf(OpenLocationCode.SEPARATOR_) >= 0 && code.indexOf(OpenLocationCode.SEPARATOR_) < OpenLocationCode.SEPARATOR_POSITION_;
  };

  /**
   * Determines if a code is a valid full Open Location Code.
   *
   * @param {string} code The string to check.
   * @return {boolean} True if the code represents a valid latitude and longitude combination.
   */
  public static isFull(code: string): boolean {
    if (!OpenLocationCode.isValid(code)) {
      return false;
    }
    // If it's short, it's not full.
    if (OpenLocationCode.isShort(code)) {
      return false;
    }

    // Work out what the first latitude character indicates for latitude.
    const firstLatValue = OpenLocationCode.CODE_ALPHABET_.indexOf(code.charAt(0).toUpperCase()) * OpenLocationCode.ENCODING_BASE_;
    if (firstLatValue >= OpenLocationCode.LATITUDE_MAX_ * 2) {
      return false; // The code would decode to a latitude of >= 90 degrees.
    }
    if (code.length > 1) {
      // Work out what the first longitude character indicates for longitude.
      const firstLngValue = OpenLocationCode.CODE_ALPHABET_.indexOf(code.charAt(1).toUpperCase()) * OpenLocationCode.ENCODING_BASE_;
      if (firstLngValue >= OpenLocationCode.LONGITUDE_MAX_ * 2) {
        return false; // The code would decode to a longitude of >= 180 degrees.
      }
    }
    return true;
  };

  public contains(latitude: number, longitude: number): boolean {
    const codeArea = OpenLocationCode.decode(this.getCode());
    return codeArea.latitudeLo <= latitude
      && latitude < codeArea.latitudeHi
      && codeArea.longitudeLo <= longitude
      && longitude < codeArea.longitudeHi;
  }

  /**
   * Encode a location into an Open Location Code.
   *
   * @param {number} latitude The latitude in signed decimal degrees. It will
   *     be clipped to the range -90 to 90.
   * @param {number} longitude The longitude in signed decimal degrees. Will be
   *     normalised to the range -180 to 180.
   * @param {?number} codeLength The length of the code to generate. If
   *     omitted, the value OpenLocationCode.CODE_PRECISION_NORMAL will be used.
   *     For a more precise result, OpenLocationCode.CODE_PRECISION_EXTRA is
   *     recommended.
   * @return {string} The code.
   * @throws {Exception} if any of the input values are not numbers.
   */
  public static encode(latitude: number, longitude: number, codeLength: number = OpenLocationCode.CODE_PRECISION_NORMAL): string {
    if (codeLength < 2 || (codeLength < OpenLocationCode.PAIR_CODE_LENGTH_ && codeLength % 2 === 1)) {
      throw new Error("IllegalArgumentException: Invalid Open Location Code length");
    }

    const editedCodeLength = Math.min(OpenLocationCode.MAX_DIGIT_COUNT_, codeLength);

    // Ensure that latitude and longitude are valid.
    let editedLatitude = OpenLocationCode.clipLatitude(latitude);
    const editedLongitude = OpenLocationCode.normalizeLongitude(longitude);
    // Latitude 90 needs to be adjusted to be just less, so the returned code
    // can also be decoded.
    if (editedLatitude === 90) {
      editedLatitude = editedLatitude - OpenLocationCode.computeLatitudePrecision(editedCodeLength);
    }
    let code = '';

    // Compute the code.
    // This approach converts each value to an integer after multiplying it by
    // the final precision. This allows us to use only integer operations, so
    // avoiding any accumulation of floating point representation errors.

    // Multiply values by their precision and convert to positive.
    // Force to integers so the division operations will have integer results.
    // Note: JavaScript requires rounding before truncating to ensure precision!
    let latVal =
        Math.floor(Math.round((editedLatitude + OpenLocationCode.LATITUDE_MAX_) * OpenLocationCode.FINAL_LAT_PRECISION_ * 1e6) / 1e6);
    let lngVal =
        Math.floor(Math.round((editedLongitude + OpenLocationCode.LONGITUDE_MAX_) * OpenLocationCode.FINAL_LNG_PRECISION_ * 1e6) / 1e6);

    // Compute the grid part of the code if necessary.
    if (editedCodeLength > OpenLocationCode.PAIR_CODE_LENGTH_) {
      for (let i = 0; i < OpenLocationCode.MAX_DIGIT_COUNT_ - OpenLocationCode.PAIR_CODE_LENGTH_; i++) {
        const latDigit = latVal % OpenLocationCode.GRID_ROWS_;
        const lngDigit = lngVal % OpenLocationCode.GRID_COLUMNS_;
        const ndx = latDigit * OpenLocationCode.GRID_COLUMNS_ + lngDigit;
        code = OpenLocationCode.CODE_ALPHABET_.charAt(ndx) + code;
        // Note! Integer division.
        latVal = Math.floor(latVal / OpenLocationCode.GRID_ROWS_);
        lngVal = Math.floor(lngVal / OpenLocationCode.GRID_COLUMNS_);
      }
    } else {
      latVal = Math.floor(latVal / Math.pow(OpenLocationCode.GRID_ROWS_, OpenLocationCode.GRID_CODE_LENGTH_));
      lngVal = Math.floor(lngVal / Math.pow(OpenLocationCode.GRID_COLUMNS_, OpenLocationCode.GRID_CODE_LENGTH_));
    }
    // Compute the pair section of the code.
    for (let i = 0; i < OpenLocationCode.PAIR_CODE_LENGTH_ / 2; i++) {
      code = OpenLocationCode.CODE_ALPHABET_.charAt(lngVal % OpenLocationCode.ENCODING_BASE_) + code;
      code = OpenLocationCode.CODE_ALPHABET_.charAt(latVal % OpenLocationCode.ENCODING_BASE_) + code;
      latVal = Math.floor(latVal / OpenLocationCode.ENCODING_BASE_);
      lngVal = Math.floor(lngVal / OpenLocationCode.ENCODING_BASE_);
    }

    // Add the separator character.
    code = code.substring(0, OpenLocationCode.SEPARATOR_POSITION_) +
        OpenLocationCode.SEPARATOR_ +
        code.substring(OpenLocationCode.SEPARATOR_POSITION_);


    // If we don't need to pad the code, return the requested section.
    if (editedCodeLength >= OpenLocationCode.SEPARATOR_POSITION_) {
      return code.substring(0, editedCodeLength + 1);
    }
    // Pad and return the code.
    return code.substring(0, editedCodeLength) +
        Array(OpenLocationCode.SEPARATOR_POSITION_ - editedCodeLength + 1).join(OpenLocationCode.PADDING_CHARACTER_) + OpenLocationCode.SEPARATOR_;
  };

  /**
   * Decodes an Open Location Code into its location coordinates.
   *
   * Returns a CodeArea object that includes the coordinates of the bounding
   * box - the lower left, center and upper right.
   *
   * @param {string} code The code to decode.
   * @return {CodeArea} An object with the coordinates of the
   *     area of the code.
   * @throws {Exception} If the code is not valid.
   */
  public static decode(code: string): CodeArea {
    // This calculates the values for the pair and grid section separately, using
    // integer arithmetic. Only at the final step are they converted to floating
    // point and combined.
    if (!OpenLocationCode.isFull(code)) {
      throw new Error("IllegalArgumentException: Passed Open Location Code is not a valid full code: " + code);
    }
    // Strip the '+' and '0' characters from the code and convert to upper case.
    const editedCode = code.replace(OpenLocationCode.SEPARATOR_, '')
        .replace(new RegExp(OpenLocationCode.PADDING_CHARACTER_ + OpenLocationCode.SEPARATOR_), '')
        .toUpperCase();

    // Initialise the values for each section. We work them out as integers and
    // convert them to floats at the end.
    let normalLat = -OpenLocationCode.LATITUDE_MAX_ * OpenLocationCode.PAIR_PRECISION_;
    let normalLng = -OpenLocationCode.LONGITUDE_MAX_ * OpenLocationCode.PAIR_PRECISION_;
    let gridLat = 0;
    let gridLng = 0;
    // How many digits do we have to process?
    let digits = Math.min(editedCode.length, OpenLocationCode.PAIR_CODE_LENGTH_);
    // Define the place value for the most significant pair.
    let pv = OpenLocationCode.PAIR_FIRST_PLACE_VALUE_;
    // Decode the paired digits.
    for (let position = 0; position < digits; position += 2) {
      normalLat += OpenLocationCode.CODE_ALPHABET_.indexOf(editedCode.charAt(position)) * pv;
      normalLng += OpenLocationCode.CODE_ALPHABET_.indexOf(editedCode.charAt(position + 1)) * pv;
      if (position < digits - 2) {
        pv /= OpenLocationCode.ENCODING_BASE_;
      }
    }
    // Convert the place value to a float in degrees.
    let latPrecision = pv / OpenLocationCode.PAIR_PRECISION_;
    let lngPrecision = pv / OpenLocationCode.PAIR_PRECISION_;
    // Process any extra precision digits.
    if (editedCode.length > OpenLocationCode.PAIR_CODE_LENGTH_) {
      // Initialise the place values for the grid.
      let rowpv = OpenLocationCode.GRID_LAT_FIRST_PLACE_VALUE_;
      let colpv = OpenLocationCode.GRID_LNG_FIRST_PLACE_VALUE_;
      // How many digits do we have to process?
      digits = Math.min(editedCode.length, OpenLocationCode.MAX_DIGIT_COUNT_);
      for (let i = OpenLocationCode.PAIR_CODE_LENGTH_; i < digits; i++) {
        const digitVal = OpenLocationCode.CODE_ALPHABET_.indexOf(editedCode.charAt(i));
        const row = Math.floor(digitVal / OpenLocationCode.GRID_COLUMNS_);
        const col = digitVal % OpenLocationCode.GRID_COLUMNS_;
        gridLat += row * rowpv;
        gridLng += col * colpv;
        if (i < digits - 1) {
          rowpv /= OpenLocationCode.GRID_ROWS_;
          colpv /= OpenLocationCode.GRID_COLUMNS_;
        }
      }
      // Adjust the precisions from the integer values to degrees.
      latPrecision = rowpv / OpenLocationCode.FINAL_LAT_PRECISION_;
      lngPrecision = colpv / OpenLocationCode.FINAL_LNG_PRECISION_;
    }
    // Merge the values from the normal and extra precision parts of the code.
    const lat = normalLat / OpenLocationCode.PAIR_PRECISION_ + gridLat / OpenLocationCode.FINAL_LAT_PRECISION_;
    const lng = normalLng / OpenLocationCode.PAIR_PRECISION_ + gridLng / OpenLocationCode.FINAL_LNG_PRECISION_;
    // Multiple values by 1e14, round and then divide. This reduces errors due
    // to floating point precision.
    return new CodeArea(
        Math.round(lat * 1e14) / 1e14, Math.round(lng * 1e14) / 1e14,
        Math.round((lat + latPrecision) * 1e14) / 1e14,
        Math.round((lng + lngPrecision) * 1e14) / 1e14,
        Math.min(editedCode.length, OpenLocationCode.MAX_DIGIT_COUNT_));


  };

  /**
   * Recover the nearest matching code to a specified location.
   *
   * Given a valid short Open Location Code this recovers the nearest matching
   * full code to the specified location.
   *
   * @param {string} shortCode A valid short code.
   * @param {number} latitude The latitude to use for the reference
   *     location.
   * @param {number} longitude The longitude to use for the reference
   *     location.
   * @return {string} The nearest matching full code to the reference location.
   * @throws {Exception} if the short code is not valid, or the reference
   *     position values are not numbers.
   */
  public static recoverNearest(shortCode: string, latitude: number, longitude: number): string {
    if (!OpenLocationCode.isShort(shortCode)) {
      if (OpenLocationCode.isFull(shortCode)) {
        return shortCode;
      } else {
        throw new Error("ValueError: Passed short code is not valid: " + shortCode);
      }
    }

    const referenceLatitude = OpenLocationCode.clipLatitude(latitude);
    const referenceLongitude = OpenLocationCode.normalizeLongitude(longitude);
    const shortCodeUpper = shortCode.toUpperCase(); // Clean up the passed code.
    // Compute the number of digits we need to recover.
    const paddingLength = OpenLocationCode.SEPARATOR_POSITION_ - shortCodeUpper.indexOf(OpenLocationCode.SEPARATOR_);
    const resolution = Math.pow(20, 2 - (paddingLength / 2)); // The resolution (height and width) of the padded area in degrees.
    const halfResolution = resolution / 2.0; // Distance from the center to an edge (in degrees).

    // Use the reference location to pad the supplied short code and decode it.
    const codeArea = OpenLocationCode.decode(OpenLocationCode.encode(referenceLatitude, referenceLongitude).substr(0, paddingLength) + shortCodeUpper);
    // How many degrees latitude is the code from the reference? If it is more
    // than half the resolution, we need to move it north or south but keep it
    // within -90 to 90 degrees.
    if (referenceLatitude + halfResolution < codeArea.latitudeCenter && codeArea.latitudeCenter - resolution >= -OpenLocationCode.LATITUDE_MAX_) {
      // If the proposed code is more than half a cell north of the reference location,
      // it's too far, and the best match will be one cell south.
      codeArea.latitudeCenter -= resolution;
    } else if (referenceLatitude - halfResolution > codeArea.latitudeCenter &&
      codeArea.latitudeCenter + resolution <= OpenLocationCode.LATITUDE_MAX_) {
      // If the proposed code is more than half a cell south of the reference location,
      // it's too far, and the best match will be one cell north.
      codeArea.latitudeCenter += resolution;
    }

    // How many degrees longitude is the code from the reference?
    if (referenceLongitude + halfResolution < codeArea.longitudeCenter) {
      codeArea.longitudeCenter -= resolution;
    } else if (referenceLongitude - halfResolution > codeArea.longitudeCenter) {
      codeArea.longitudeCenter += resolution;
    }

    return OpenLocationCode.encode(codeArea.latitudeCenter, codeArea.longitudeCenter, codeArea.codeLength);
  };

  /**
   * Remove characters from the start of an OLC code.
   *
   * This uses a reference location to determine how many initial characters
   * can be removed from the OLC code. The number of characters that can be
   * removed depends on the distance between the code center and the reference
   * location.
   *
   * @param {string} code The full code to shorten.
   * @param {number} latitude The latitude to use for the reference location.
   * @param {number} longitude The longitude to use for the reference location.
   * @return {string} The code, shortened as much as possible that it is still
   *     the closest matching code to the reference location.
   * @throws {Exception} if the passed code is not a valid full code or the
   *     reference location values are not numbers.
   */
  public static shorten(code: string, latitude: number, longitude: number): string {
    if (!OpenLocationCode.isFull(code)) {
      throw new Error("ValueError: Passed code is not valid and full: " + code);
    }
    if (code.indexOf(OpenLocationCode.PADDING_CHARACTER_) !== -1) {
      throw new Error("ValueError: Cannot shorten padded codes: " + code);
    }

    const codeUpper = code.toUpperCase();
    const codeArea = OpenLocationCode.decode(codeUpper);
    if (codeArea.codeLength < OpenLocationCode.MIN_TRIMMABLE_CODE_LEN_) {
      throw new Error("ValueError: Code length must be at least " + OpenLocationCode.MIN_TRIMMABLE_CODE_LEN_);
    }

    const latitudeClipped = OpenLocationCode.clipLatitude(latitude);
    const longitudeClipped = OpenLocationCode.normalizeLongitude(longitude);

    // How close are the latitude and longitude to the code center.
    const range = Math.max(Math.abs(codeArea.latitudeCenter - latitudeClipped), Math.abs(codeArea.longitudeCenter - longitudeClipped));
    for (let i = OpenLocationCode.PAIR_RESOLUTIONS_.length - 2; i >= 1; i--) {
      // Check if we're close enough to shorten. The range must be less than 1/2
      // the resolution to shorten at all, and we want to allow some safety, so
      // use 0.3 instead of 0.5 as a multiplier.
      if (range < (OpenLocationCode.PAIR_RESOLUTIONS_[i] * 0.3)) {
        // Trim it.
        return codeUpper.substring((i + 1) * 2);
      }
    }
    return codeUpper;
  };

  /**
   * Clip a latitude into the range -90 to 90.
   *
   * @param {number} latitude
   * @return {number} The latitude value clipped to be in the range.
   */
  private static clipLatitude(latitude: number): number {
    return Math.min(90, Math.max(-90, latitude));
  };

  /**
   * Compute the latitude precision value for a given code length.
   * Lengths <= 10 have the same precision for latitude and longitude, but
   * lengths > 10 have different precisions due to the grid method having
   * fewer columns than rows.
   * @param {number} codeLength
   * @return {number} The latitude precision in degrees.
   */
  private static computeLatitudePrecision(codeLength: number): number {
    if (codeLength <= 10) {
      return Math.pow(20, Math.floor(codeLength / -2 + 2));
    }
    return Math.pow(20, -3) / Math.pow(OpenLocationCode.GRID_ROWS_, codeLength - 10);
  };

  /**
   * Normalize a longitude into the range -180 to 180, not including 180.
   *
   * @param {number} longitude
   * @return {number} Normalized into the range -180 to 180.
   */
  private static normalizeLongitude(longitude: number): number {
    let longitudeOutput = longitude;
    while (longitudeOutput < -180) {
      longitudeOutput = longitudeOutput + 360;
    }
    while (longitudeOutput >= 180) {
      longitudeOutput = longitudeOutput - 360;
    }
    return longitudeOutput;
  };
}
