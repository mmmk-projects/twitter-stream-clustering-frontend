import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';

import p5 from 'p5';
import 'p5/lib/addons/p5.dom';

import { ClusteringService } from './../shared/services/clustering.service';

import { Atom } from './../shared/models/atom.model';


@Component({
  selector: 'app-clustering',
  templateUrl: './clustering.component.html',
  styleUrls: ['./clustering.component.scss']
})
export class ClusteringComponent implements OnInit, OnDestroy {

  private sketchId = 'sketch-clustering';

  private atoms: Atom[];

  private minSize: number;

  private subscription: Subscription

  minValue: number;
  maxValue: number;
  stepValue: number;
  startingValue: number;

  constructor(private router: Router, private clusteringService: ClusteringService) { }

  ngOnInit() {
    this.minValue = 1;
    this.maxValue = 65;
    this.stepValue = 2;
    this.startingValue = this.minSize = 5;

    this.createCanvas();
  }

  onSliderChanged(event: any) {
    this.minSize = event.value;
  }

  private createCanvas() {
    new p5((sketch: any) => {

      const getX = (x: number) => width / 2 + x * xOffset;
      const getY = (y: number) => height / 2 + y * yOffset;

      const isClicked = (mouseX: number, mouseY: number, xPos: number, yPos: number, radius: number) => {
        return mouseX >= xPos - radius && mouseX <= xPos + radius && mouseY >= yPos - radius && mouseY <= yPos + radius;
      };

      const width = sketch.windowWidth * 0.99;
      const height = sketch.windowHeight * 0.8;
      const textSize = sketch.windowWidth / 135;
      const framerate = 60;

      const colors = ['#94525e', '#6f5e5b', '#403f69', '#a4ae9e', '#b79147', '#b34f3d', '#6b81a9', '#ab83ae',
                      '#94525e', '#6f5e5b', '#403f69', '#a4ae9e', '#b79147', '#b34f3d', '#6b81a9', '#ab83ae',
                      '#94525e', '#6f5e5b', '#403f69', '#a4ae9e', '#b79147', '#b34f3d', '#6b81a9', '#ab83ae'];

      const diameter = width * 0.075;

      var xOffset: number;
      var yOffset: number;

      var loadingAnimation: any;
      var loadingCanvas: any;

      sketch.setup = () => {
        sketch.createCanvas(width, height);
        sketch.frameRate(framerate);
        sketch.ellipseMode(sketch.CENTER);
        sketch.rectMode(sketch.CENTER);
        sketch.angleMode(sketch.DEGREES);
        sketch.textSize(textSize);
        sketch.textFont('Nunito');
        sketch.textAlign(sketch.CENTER, sketch.CENTER);
        
        this.atoms = [];

        loadingAnimation = sketch.select('.bubbles-wrapper');

        this.subscription = this.clusteringService.clustering.subscribe((response: Response) => {
          const clusters = response['clusters'];
          if (clusters) {
            if (this.atoms.length === 0 || this.atoms.length != clusters.length) {
              xOffset = 0.4 * width / response['maxX'];
              yOffset = 0.3 * height / response['maxY'];
            }
            if (this.atoms.length === 0 || this.atoms.length != clusters.length) {
              this.atoms = clusters.map((cluster: any) => {
                return new Atom(cluster['id'], '#' + cluster['hashtags'][0], getX(cluster['x']), getY(cluster['y']), diameter, cluster['size'], colors[cluster['id'] - 1], sketch);
              });
            } else {
              for (let i = 0, j = 0; i < this.atoms.length && clusters.length > 0; i++) {
                const atom = this.atoms[i];
                const cluster = clusters[j];
                if (cluster && atom.id === cluster['id']) {
                  atom.hashtag = '#' + cluster['hashtags'][0];
                  atom.updateNumElectrons(cluster['size']);
                  atom.updatePosition(sketch.createVector(getX(cluster['x']), getY(cluster['y'])));
                  j++;
                }
              }
            }
          }
        });
      };

      sketch.draw = () => {
        sketch.clear();

        if (this.atoms.length > 0) {
          loadingAnimation.addClass('display-none');
          this.atoms.filter((atom) => atom.numElectrons >= this.minSize).forEach((atom) => atom.draw(sketch));
        }
      };

      sketch.mouseClicked = () => {
        const clickedAtom = this.atoms.find((atom) => {
          return atom.numElectrons >= this.minSize
              && isClicked(sketch.mouseX, sketch.mouseY, atom.position.x, atom.position.y, atom.diameter / 2);
        });

        if (clickedAtom) {
          this.router.navigate(['/detail', clickedAtom.id]);
          sketch.remove()
        }
      };

    }, this.sketchId);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
