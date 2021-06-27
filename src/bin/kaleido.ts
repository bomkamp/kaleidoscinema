#!/usr/bin/env node

import { program } from 'commander';
import { kaleido } from '../kaleido/kaleido';

program
    .argument('<image>', 'Path to image file to add a prominent color palette to.')
    .option('-n, --number-colors <number>', 'Number of colors to add to the palette.')
    .option('-h, --height <number>', 'The Width of the output image.')
    .option('-w, --width <number>', 'The height of the output image.')
    .option('-r, --palette-ratio <number>', 'The amount/ratio of the image that should contain the color palette (0 - 1).')
    .option('-o, --output-filename <string>', 'The output filename for the new image.')
    .action(async (image: string, opts: any) => {
        await kaleido({
            imagePath: image,
            colorCount: Number.parseInt(opts.numberColors),
            filename: opts.outputFilename,
            paletteRatio: Number.parseFloat(opts.paletteRatio),
            height: Number.parseInt(opts.height),
            width: Number.parseInt(opts.width),
        })
    })
    .addHelpCommand()
    .parse(process.argv);
