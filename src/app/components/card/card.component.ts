import { Component } from '@angular/core';
import { CookieService } from 'src/app/services/cookie.service';
import { DataService } from 'src/app/services/data.service';

interface CardItem {
  _id: string;
  value: number;
}

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent {
  card: any = [];

  constructor(private dataService: DataService) {}

  async ngOnInit() {
    await this.getCard();
  }

  private async getCard() {
    const data = await this.dataService.getCard();
    const cardItems: CardItem[] = data.card.items; // Specify type for cardItems
    const products = data.products;

    // Create a mapping of item IDs to their corresponding values
    const cardItemValues: { [key: string]: number } = {}; // Specify type for cardItemValues
    cardItems.forEach((item) => {
      cardItemValues[item._id] = item.value;
    });

    // Map the value from the card object to the products array
    this.card = products.map((product: any) => {
      const customersValue = cardItemValues[product._id]; // Rename to customersValue
      return { ...product, customersValue }; // Rename the property
    });
    console.log(this.card);
  }

  async removeFromCard(item: any) {
    await this.dataService.removeFromCard(item);
    this.getCard();
  }

  async addToCard(item: any) {
    await this.dataService.addToCard(item);
    this.getCard();
  }
}
