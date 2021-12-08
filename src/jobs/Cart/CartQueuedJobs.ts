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
    let checkout = await LocalStorageHandler.getCheckout();
    if (checkout?.timestamp) {
      checkout = checkout?.item;
    }
    if (checkout) {
      const { data, error } = await this.apolloClientManager.setCartItem(
        checkout?._W ? checkout?._W : checkout
      );
      if (error && this.onErrorListener) {
        this.onErrorListener(error, ErrorCartTypes.SET_CART_ITEM);
        return { error };
      } else if (data) {
        let obj = {
          ...(checkout?._W ? checkout?._W : checkout),
          availablePaymentGateways: data.availablePaymentGateways,
          availableShippingMethods: data.availableShippingMethods,
          promoCodeDiscount: data.promoCodeDiscount,
          shippingMethod: data.shippingMethod,
        };
        if(checkout?.lines?.length !== data?.lines?.length){
          let lc = await LocalStorageHandler.getCheckout();
          if (lc?.timestamp) {
            lc = lc?.item;
          }
          const ll = data?.lines?.filter(l => lc?.lines?.find(li => li?.variant?.id === l?.variant?.id));
          obj = {
            ...obj,
            lines: ll
          };
        }
        await this.localStorageHandler.setCheckout(obj);
        return { data };
      }
    }
  };
}
