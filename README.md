# High Scores

Vercel serverless function to operate the high score system for my [final project](http://www.codeskulptor.org/#user47_phtMVqzmdN_6.py) for Coursera's [An Introduction to Interactive Programming in Python (Part 2)](https://www.coursera.org/learn/interactive-python-2?specialization=computer-fundamentals#syllabus).

This project uses Node Canvas to generate images on the fly. See [this thread](https://github.com/zeit/now/issues/3460) for info about getting node-canvas working in a serverless environment.

## Installation

Download the repository and install the required packages:

```bash
npm install
```

To upload to vercel, you will need to install vercel:

```bash
npm install -g vercel
```

You will then need to log in to vercel, so set up an account there if you don't have one already and then run:

```bash
vercel login
```

You will also need to rename your .env.sample file to .env and populate the fields there as required.

Finally, you will need to install the font, which cannot be included on GitHub due to licensing restrictions. Please download the ka2 font from [here](https://www.freefontspro.com/otf/1277/cosmos0.font) and place it in a folder called "fonts" in the root of the project.

## Deploy

To run locally, run:

```bash
vercel dev
```

To deploy, run:

```bash
vercel
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## MIT License

Copyright 2020, David Heidelberger

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
