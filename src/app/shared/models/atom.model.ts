declare var require: any;

import { COLORS, MAX_VELOCITY, ORBITALS } from './constants';

import { Shell } from './shell.model';

const p5 = require('p5');

export class Atom {

  hashtag: string;

  position: any;
  velocity: any;

  diameter: number;

  numElectrons: number;
  shells: Shell[];

  bound: number;

  constructor(hashtag: string, x: number, y: number, diameter: number, numElectrons: number, sketch: any) {
    this.hashtag = hashtag;

    this.position = sketch.createVector(x, y);
    this.velocity = p5.Vector.random2D();
    this.velocity.setMag(MAX_VELOCITY);

    this.diameter = diameter;

    this.numElectrons = numElectrons;
    this.shells = [];
    this.getElectronConfiguration(numElectrons).forEach((numElectrons, index) => {
      this.shells.push(new Shell(this, index + 1, numElectrons));
    });

    this.bound = this.shells[this.shells.length - 1].diameter / 2;
  }

  getElectronConfiguration(numElectrons: number) {
    let orbitals = '';
    for (let i = 0; numElectrons > 0 && i < ORBITALS.length; i++) {
      const { name, size } = ORBITALS[i];
      numElectrons -= size;
      const numInOrbital = (numElectrons < 0) ? (size - Math.abs(numElectrons)) : size;
      orbitals = orbitals.concat(name + numInOrbital + ' ');
    }
    orbitals = orbitals.substring(0, orbitals.length - 1);

    const configuration = [];
    orbitals.split(' ').forEach((orbital) => {
      const orbitalArr = orbital.split(/[a-z]/g);
      const level = parseInt(orbitalArr[0]) - 1;
      const numElectrons = parseInt(orbitalArr[1]);
      if (configuration[level]) {
        configuration[level] += numElectrons;
      } else {
        configuration[level] = numElectrons;
      }
    });

    return configuration;
  }

  draw(sketch: any) {
    this.shells.forEach((shell) => shell.draw(sketch));

    sketch.noStroke();
    sketch.fill(COLORS.GRAY);
    sketch.ellipse(this.position.x, this.position.y, this.diameter);

    sketch.fill(COLORS.WHITE);
    sketch.text(this.hashtag, this.position.x, this.position.y, this.diameter, this.diameter / 2);

    if (this.position.x - this.bound < 0 || this.position.x + this.bound > sketch.windowWidth * .99) {
      this.velocity.x = -this.velocity.x;
    }
    if (this.position.y - this.bound < 0 || this.position.y + this.bound > sketch.windowHeight * .8) {
      this.velocity.y = -this.velocity.y;
    }
    this.position.add(this.velocity);
  }

}
