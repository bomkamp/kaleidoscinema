import getColors from 'get-image-colors';
import Jimp, { cssColorToHex } from 'jimp';
import { DEFAULT_PALETTE_RATIO, DEFAULT_IMAGE_HEIGHT, DEFAULT_IMAGE_WIDTH, DEFAULT_PALETTE_COLORS } from '../util/constants';

interface ColorProps {
  imagePath: string;
  colorCount?: number;
};

interface ColorPaletteImageProps {
  colors: string[];
  filename?: string;
  height?: number;
  width?: number;
};

interface OutputImage {
  filename?: string;
  height?: number;
  width?: number;
}

interface CombinedImagePaletteProps extends OutputImage {
  imagePath: string;
  paletteImagePath: string;
  paletteRatio?: number;
}

/**
 * Configuration for running kaleido on an image
 */
export interface KaleidoProps {
  /**
       * Path to the image to add color palette to.
       */
  imagePath: string;

  /**
       * Number of colors to add to the color palette.
       *
       * @default 7
       */
  colorCount?: number;

  /**
       * What ratio of the image should be of the color palette. (e.g. '.8' means that 80% of the image will be the color palette & the other 20% will be the original image.)
       *
       * @default .2
       */
  paletteRatio?: number;

  /**
       * The output file name
       *
       * @default kaleido.png
       */
  filename?: string;

  /**
       * The output file width in pixels
       *
       * @default 864
       */
  height?: number;

  /**
       * The output file width in pixels
       *
       * @default 1080
       */
  width?: number;
};

/**
 * Gets most prominent colors from an image and returns their hex values
 *
 * @param props Props for analyzing the image
 * @returns an array containing the hex colors
 */
const getProminentColors = async (props: ColorProps): Promise<string[]> => {
  const colorCount = props.colorCount ? props.colorCount : DEFAULT_PALETTE_COLORS;

  const palette = await getColors(props.imagePath, {
    count: colorCount,
  });

  return palette.map(color => color.hex());
};

/**
 * Creates & writes palette.png with the specified colors in props
 *
 * @param props Properties for creating color palette
 */
const createColorPaletteImage = async (props: ColorPaletteImageProps) => {
  const height = props.height || (DEFAULT_IMAGE_HEIGHT * (DEFAULT_PALETTE_RATIO));
  const width = props.width || DEFAULT_IMAGE_WIDTH;

  const palette = new Jimp(width, 1, cssColorToHex('#FFFFFF'));
  for (let i = 0; i < width; i++) {
    const marker = width / props.colors.length;
    for (let x = 0; x < props.colors.length; x++) {
      if (i <= ((x + 1) * marker)) {
        palette.setPixelColor(cssColorToHex(props.colors[x]), i, 0);
        break;
      }
    }
  }
  palette.resize(width, height);
  await palette.writeAsync(props.filename || 'palette.png');
};

const combineImageAndPalette = async (props: CombinedImagePaletteProps): Promise<void> => {
  if (props.paletteRatio && props.paletteRatio >= 1 || props.paletteRatio && props.paletteRatio < 0) {
    throw new Error("'paletteRatio' must be between 0 & 1 inclusively.");
  }
  const palette = await Jimp.read(props.paletteImagePath);
  const image = await Jimp.read(props.imagePath);

  image.resize(props.width || DEFAULT_IMAGE_WIDTH, (props.height || DEFAULT_IMAGE_HEIGHT) * (1 - (props.paletteRatio || DEFAULT_PALETTE_RATIO)));
  const final = new Jimp(props.width || DEFAULT_IMAGE_WIDTH, props.height || DEFAULT_IMAGE_HEIGHT, cssColorToHex('#FFFFFF'));

  final.blit(image, 0, 0);
  final.blit(palette, 0, (props.height || DEFAULT_IMAGE_HEIGHT) * (1 - (props.paletteRatio || DEFAULT_PALETTE_RATIO)));
  final.write(props.filename || 'kaleido.png'); // save
};

/**
 * Adds a color palette to the provided image of the most prominent colors in the image.
 *
 * @param props Properties to configure method
 */
export const kaleido = async (props: KaleidoProps) => {
  const colors = await getProminentColors({
    imagePath: props.imagePath,
    colorCount: props.colorCount,
  });

  await createColorPaletteImage({
    colors,
    filename: props.filename || 'kaleido.png',
    height: (props.height || DEFAULT_IMAGE_HEIGHT) * (props.paletteRatio || DEFAULT_PALETTE_RATIO),
    width: props.width,
  });

  await combineImageAndPalette({
    imagePath: props.imagePath,
    paletteImagePath: props.filename || 'kaleido.png',
    filename: props.filename,
    height: props.height,
    width: props.width,
    paletteRatio: props.paletteRatio,
  });
};