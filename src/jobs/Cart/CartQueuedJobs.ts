import { ApolloClientManager } from "../../data/ApolloClientManager";
import { LocalStorageHandler } from "../../helpers/LocalStorageHandler";

import { QueuedJobsHandler } from "../QueuedJobsHandler";

export enum ErrorCartTypes {
  "SET_CART_ITEM",
}

export class CartQueuedJobs extends QueuedJobsHandler<ErrorCartTypes> {
  private apolloClientManager: ApolloClientManager;

  private localStorageHandler: LocalStorageHandler;

  constructor(
    localStorageHandler: LocalStorageHandler,
    apolloClientManager: ApolloClientManager
  ) {
    super();
    this.localStorageHandler = localStorageHandler;
    this.apolloClientManager = apolloClientManager;
  }

  setCartItem = async () => {
    const checkout = await LocalStorageHandler.getCheckout();
    if (checkout) {
      const { data, error } = await this.apolloClientManager.setCartItem(
        checkout
      );
      if (error && this.onErrorListener) {
        this.onErrorListener(error, ErrorCartTypes.SET_CART_ITEM);
        return { error };
      }
      if (data) {
        let obj = {
          ...checkout,
          availablePaymentGateways: data.availablePaymentGateways,
          availableShippingMethods: data.availableShippingMethods,
          promoCodeDiscount: data.promoCodeDiscount,
          shippingMethod: data.shippingMethod,
        };
        if (checkout?.lines?.length !== data?.lines?.length) {
          obj = {
            ...obj,
            lines: data?.lines,
          };
        }
        await this.localStorageHandler.setCheckout(obj);
        return { data };
      }
    }
    return true;
  };
}
