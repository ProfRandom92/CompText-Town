import Phaser from 'phaser';

export interface Interactable {
  id: string;
  label: string;
  x: number;
  y: number;
  radius: number;
  onInteract: () => void;
}

export class InteractionSystem {
  private interactables: Interactable[] = [];

  register(interactable: Interactable) {
    this.interactables.push(interactable);
  }

  nearest(point: Phaser.Math.Vector2): Interactable | undefined {
    return this.interactables
      .map((interactable) => ({
        interactable,
        distance: Phaser.Math.Distance.Between(point.x, point.y, interactable.x, interactable.y),
      }))
      .filter(({ interactable, distance }) => distance <= interactable.radius)
      .sort((a, b) => a.distance - b.distance)[0]?.interactable;
  }
}
