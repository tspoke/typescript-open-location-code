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
class CodeArea {
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
  private isPadded(): boolean {
    return this.code.indexOf(OpenLocationCode.PADDING_CHARACTER_) >= 0;
  }

  private static readonly CODE_PRECISION_NORMAL = 10;
  private static readonly CODE_PRECISION_EXTRA = 11;

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

  // Number of columns in the grid refinement method.
  private static readonly GRID_COLUMNS_ = 4;

  // Number of rows in the grid refinement method.
  private static readonly GRID_ROWS_ = 5;

  // Size of the initial grid in degrees.
  private static readonly GRID_SIZE_DEGREES_ = 0.000125;

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
    // Ensure that latitude and longitude are valid.
    let clippedLatitude = OpenLocationCode.clipLatitude(latitude);
    const clippedLongitude = OpenLocationCode.normalizeLongitude(longitude);
    // Latitude 90 needs to be adjusted to be just less, so the returned code
    // can also be decoded.
    if (clippedLatitude === 90) {
      clippedLatitude = clippedLatitude - OpenLocationCode.computeLatitudePrecision(codeLength);
    }
    let code = OpenLocationCode.encodePairs(clippedLatitude, clippedLongitude, Math.min(codeLength, OpenLocationCode.PAIR_CODE_LENGTH_));
    // If the requested length indicates we want grid refined codes.
    if (codeLength > OpenLocationCode.PAIR_CODE_LENGTH_) {
      code += OpenLocationCode.encodeGrid(clippedLatitude, clippedLongitude, codeLength - OpenLocationCode.PAIR_CODE_LENGTH_);
    }
    return code;
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
    if (!OpenLocationCode.isFull(code)) {
      throw new Error("IllegalArgumentException: Passed Open Location Code is not a valid full code: " + code);
    }
    // Strip out separator character (we've already established the code is
    // valid so the maximum is one), padding characters and convert to upper
    // case.
    let editedCode = code.replace(OpenLocationCode.SEPARATOR_, "");
    editedCode = editedCode.replace(new RegExp(OpenLocationCode.PADDING_CHARACTER_ + "+"), "");
    editedCode = editedCode.toUpperCase();

    const codeArea = OpenLocationCode.decodePairs(editedCode.substring(0, OpenLocationCode.PAIR_CODE_LENGTH_)); // Decode the lat/lng pair component.
    if (editedCode.length <= OpenLocationCode.PAIR_CODE_LENGTH_) {
      return codeArea; // If there is a grid refinement component, decode that.
    }

    const gridArea = OpenLocationCode.decodeGrid(editedCode.substring(OpenLocationCode.PAIR_CODE_LENGTH_));
    return new CodeArea(
      codeArea.latitudeLo + gridArea.latitudeLo,
      codeArea.longitudeLo + gridArea.longitudeLo,
      codeArea.latitudeLo + gridArea.latitudeHi,
      codeArea.longitudeLo + gridArea.longitudeHi,
      codeArea.codeLength + gridArea.codeLength
    );
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


  /**
   * Encode a location into a sequence of OLC lat/lng pairs.
   *
   * This uses pairs of characters (longitude and latitude in that order) to
   * represent each step in a 20x20 grid. Each code, therefore, has 1/400th
   * the area of the previous code.
   *
   * This algorithm is used up to 10 digits.
   *
   * @param {number} latitude The location to encode.
   * @param {number} longitude The location to encode.
   * @param {number} codeLength Requested code length.
   * @return {string} The up to 10-digit OLC code for the location.
   */
  private static encodePairs(latitude: number, longitude: number, codeLength: number): string {
    let code = "";
    // Adjust latitude and longitude so they fall into positive ranges.
    let adjustedLatitude = latitude + OpenLocationCode.LATITUDE_MAX_;
    let adjustedLongitude = longitude + OpenLocationCode.LONGITUDE_MAX_;
    // Count digits - can't use string length because it may include a separator
    // character.
    let digitCount = 0;
    while (digitCount < codeLength) {
      // Provides the value of digits in this place in decimal degrees.
      const placeValue = OpenLocationCode.PAIR_RESOLUTIONS_[Math.floor(digitCount / 2)];
      // Do the latitude - gets the digit for this place and subtracts that for
      // the next digit.
      let digitValue = Math.floor(adjustedLatitude / placeValue);
      adjustedLatitude -= digitValue * placeValue;
      code += OpenLocationCode.CODE_ALPHABET_.charAt(digitValue);
      digitCount += 1;
      // And do the longitude - gets the digit for this place and subtracts that
      // for the next digit.
      digitValue = Math.floor(adjustedLongitude / placeValue);
      adjustedLongitude -= digitValue * placeValue;
      code += OpenLocationCode.CODE_ALPHABET_.charAt(digitValue);
      digitCount += 1;
      // Should we add a separator here?
      if (digitCount === OpenLocationCode.SEPARATOR_POSITION_ && digitCount < codeLength) {
        code += OpenLocationCode.SEPARATOR_;
      }
    }
    if (code.length < OpenLocationCode.SEPARATOR_POSITION_) {
      code = code + Array(OpenLocationCode.SEPARATOR_POSITION_ - code.length + 1).join(OpenLocationCode.PADDING_CHARACTER_);
    }
    if (code.length === OpenLocationCode.SEPARATOR_POSITION_) {
      code = code + OpenLocationCode.SEPARATOR_;
    }
    return code;
  };


  /**
   * Encode a location using the grid refinement method into an OLC string.
   *
   * The grid refinement method divides the area into a grid of 4x5, and uses a
   * single character to refine the area. This allows default accuracy OLC codes
   * to be refined with just a single character.
   *
   * This algorithm is used for codes longer than 10 digits.
   *
   * @param {number} latitude The location to encode.
   * @param {number} longitude The location to encode.
   * @param {number} codeLength Requested code length.
   * @return {string} The OLC code digits from the 11th digit on.
   */
  private static encodeGrid(latitude: number, longitude: number, codeLength: number): string {
    let code = "";
    let latPlaceValue = OpenLocationCode.GRID_SIZE_DEGREES_;
    let lngPlaceValue = OpenLocationCode.GRID_SIZE_DEGREES_;
    // Adjust latitude and longitude so they fall into positive ranges and
    // get the offset for the required places.
    let lat = latitude + OpenLocationCode.LATITUDE_MAX_;
    let lon = longitude + OpenLocationCode.LONGITUDE_MAX_;
    // To avoid problems with floating point, get rid of the degrees.
    lat = lat % 1.0;
    lon = lon % 1.0;
    let adjustedLatitude = lat % latPlaceValue;
    let adjustedLongitude = lon % lngPlaceValue;
    for (let i = 0; i < codeLength; i++) {
      // Work out the row and column.
      const row = Math.floor(adjustedLatitude / (latPlaceValue / OpenLocationCode.GRID_ROWS_));
      const col = Math.floor(adjustedLongitude / (lngPlaceValue / OpenLocationCode.GRID_COLUMNS_));
      latPlaceValue /= OpenLocationCode.GRID_ROWS_;
      lngPlaceValue /= OpenLocationCode.GRID_COLUMNS_;
      adjustedLatitude -= row * latPlaceValue;
      adjustedLongitude -= col * lngPlaceValue;
      code += OpenLocationCode.CODE_ALPHABET_.charAt(row * OpenLocationCode.GRID_COLUMNS_ + col);
    }
    return code;
  };

  /**
   * Decode an OLC code made up of lat/lng pairs.
   *
   * This decodes an OLC code made up of alternating latitude and longitude
   * characters, encoded using base 20.
   *
   * @param {string} code The code to decode, assumed to be a valid full code,
   *     but with the separator removed.
   * @return {CodeArea} The code area object.
   */
  private static decodePairs(code: string): CodeArea {
    // Get the latitude and longitude values. These will need correcting from
    // positive ranges.
    const latitude = OpenLocationCode.decodePairsSequence(code, 0);
    const longitude = OpenLocationCode.decodePairsSequence(code, 1);
    // Correct the values and set them into the CodeArea object.
    return new CodeArea(
      latitude[0] - OpenLocationCode.LATITUDE_MAX_,
      longitude[0] - OpenLocationCode.LONGITUDE_MAX_,
      latitude[1] - OpenLocationCode.LATITUDE_MAX_,
      longitude[1] - OpenLocationCode.LONGITUDE_MAX_,
      code.length);
  };

  /**
   * Decode either a latitude or longitude sequence.
   *
   * This decodes the latitude or longitude sequence of a lat/lng pair encoding.
   * Starting at the character at position offset, every second character is
   * decoded and the value returned.
   *
   * @param {string} code A valid full OLC code, with the separator removed.
   * @param {number} offset The character to start from.
   * @return {[number]} An array of two numbers, representing the lower and
   *     upper range in decimal degrees. These are in positive ranges and will
   *     need to be corrected appropriately.
   */
  private static decodePairsSequence(code: string, offset: number): number[] {
    let i = 0;
    let value = 0;
    while (i * 2 + offset < code.length) {
      value += OpenLocationCode.CODE_ALPHABET_.indexOf(code.charAt(i * 2 + offset)) * OpenLocationCode.PAIR_RESOLUTIONS_[i];
      i += 1;
    }
    return [value, value + OpenLocationCode.PAIR_RESOLUTIONS_[i - 1]];
  };

  /**
   * Decode the grid refinement portion of an OLC code.
   *
   * @param {string} code The grid refinement section of a code.
   * @return {CodeArea} The area of the code.
   */
  private static decodeGrid(code: string): CodeArea {
    let latitudeLo = 0.0;
    let longitudeLo = 0.0;
    let latPlaceValue = OpenLocationCode.GRID_SIZE_DEGREES_;
    let lngPlaceValue = OpenLocationCode.GRID_SIZE_DEGREES_;
    let i = 0;

    while (i < code.length) {
      const codeIndex = OpenLocationCode.CODE_ALPHABET_.indexOf(code.charAt(i));
      const row = Math.floor(codeIndex / OpenLocationCode.GRID_COLUMNS_);
      const col = codeIndex % OpenLocationCode.GRID_COLUMNS_;

      latPlaceValue /= OpenLocationCode.GRID_ROWS_;
      lngPlaceValue /= OpenLocationCode.GRID_COLUMNS_;

      latitudeLo += row * latPlaceValue;
      longitudeLo += col * lngPlaceValue;
      i += 1;
    }

    return new CodeArea(latitudeLo, longitudeLo, latitudeLo + latPlaceValue, longitudeLo + lngPlaceValue, code.length);
  };
}