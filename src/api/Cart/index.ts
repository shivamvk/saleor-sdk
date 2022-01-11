import AsyncStorage from "@react-native-async-storage/async-storage";
import { LocalStorageManager } from "../../data";
import { ErrorListener } from "../../helpers";
import { ICheckoutModel } from "../../helpers/LocalStorageHandler";
import { JobsManager } from "../../jobs";
import { ErrorCartTypes } from "../../jobs/Cart";
import { SaleorState, SaleorStateLoaded } from "../../state";
import { ISaleorStateSummeryPrices, StateItems } from "../../state/types";
import { ApolloClientManager } from "../../data/ApolloClientManager";
import { sortCheckoutLines } from "./utils";
import {
  IDiscount,
  IItems,
  IShippingPrice,
  ISubtotalPrice,
  ITotalPrice,
} from "./types";
export class SaleorCartAPI extends ErrorListener {
  loaded: boolean;
  items: IItems;
  totalPrice: ITotalPrice;
  subtotalPrice: ISubtotalPrice;
  shippingPrice: IShippingPrice;
  discount?: IDiscount;
  private apolloClientManager: ApolloClientManager;
  private jobsManager: JobsManager;
  private localStorageManager: LocalStorageManager;
  private saleorState: SaleorState;
  constructor(
    localStorageManager: LocalStorageManager,
    apolloClientManager: ApolloClientManager,
    saleorState: SaleorState,
    jobsManager: JobsManager
  ) {
    super();
    this.saleorState = saleorState;
    this.localStorageManager = localStorageManager;
    this.apolloClientManager = apolloClientManager;
    this.jobsManager = jobsManager;
    this.loaded = false;
    this.jobsManager.attachErrorListener("cart", this.fireError);
    this.saleorState.subscribeToChange(
      StateItems.CHECKOUT,
      (checkout: ICheckoutModel) => {
        const checkUndefined = (lines: any) => {
          return lines?.find((line: any) => line.id === undefined);
        };
        if (checkout?._W) {
          if (this.items?.length !== checkout?._W?.lines.length || checkUndefined(this.items)) {
            this.items = checkout?._W?.lines
              ?.filter(line => line.quantity > 0);
          } else {
            this.items = this.items?.filter(line => line.quantity > 0);
          }
          // .sort(sortCheckoutLines);
        } else {
          if (this.items?.length !== checkout?.lines?.length || checkUndefined(this.items)) {
            this.items = checkout?.lines
              ?.filter(line => line.quantity > 0);
          } else {
            this.items = this.items?.filter(line => line.quantity > 0);
          }
          // .sort(sortCheckoutLines);
        }
      }
    );
    this.saleorState.subscribeToChange(
      StateItems.SUMMARY_PRICES,
      (summaryPrices: ISaleorStateSummeryPrices) => {
        const { totalPrice, subtotalPrice, shippingPrice, discount } =
          summaryPrices || {};
        this.totalPrice = totalPrice;
        this.subtotalPrice = subtotalPrice;
        this.shippingPrice = shippingPrice;
        this.discount = discount;
      }
    );
    this.saleorState.subscribeToChange(
      StateItems.LOADED,
      (loaded: SaleorStateLoaded) => {
        this.loaded = loaded.checkout && loaded.summaryPrices;
      }
    );
  }
  addItem = async (variantId: string, quantity: number) => {
    // 1. save in local storage
    await this.localStorageManager.addItemToCart(variantId, quantity);
    console.log("flick debug", this.saleorState.checkout?.lines);
    // 2. save online if possible (if checkout id available)
    // wait for a second before moving ahead to avoid flickeirng
    setTimeout(() => {
      completeAddItem();
    }, 1200);
    const completeAddItem = async () => {
      if (this.saleorState.checkout?.lines) {
        const {
          data,
          error,
        } = await this.apolloClientManager.getRefreshedCheckoutLines(
          this.saleorState.checkout?.lines
        );
        if (error) {
          this.fireError(error, ErrorCartTypes.SET_CART_ITEM);
        } else {
          // const ll = data?.filter(line => this?.saleorState?.checkout?.lines?.find(l => l?.variant?.id === line?.variant?.id));
          // console.log("flickkk debug", variantId, this.saleorState?.checkout?.lines, ll, data);
          await this.localStorageManager.getHandler().setCheckout({
            ...(this.saleorState.checkout?._W? this.saleorState.checkout?._W: this.saleorState.checkout),
            lines: data,
          });
        }
      }
    };
  };
  setCartItem = async () => {
    if (this.saleorState.checkout?._W?.id || this.saleorState.checkout?.id) {
      this.jobsManager.addToQueue("cart", "setCartItem");
      return {
        pending: true,
      };
    }
    return {
      pending: false,
    };
  }
  removeItem = async (variantId: string) => {
    // 1. save in local storage
    this.localStorageManager.removeItemFromCart(variantId);
    // 2. save online if possible (if checkout id available)
    if (this.saleorState.checkout?.lines) {
      const {
        data,
        error,
      } = await this.apolloClientManager.getRefreshedCheckoutLines(
        this.saleorState.checkout?.lines
      );
      if (error) {
        this.fireError(error, ErrorCartTypes.SET_CART_ITEM);
      } else {
        const ll = data?.filter(line => this?.saleorState?.checkout?.lines?.find(l => l?.variant?.id === line?.variant?.id));
        await this.localStorageManager.getHandler().setCheckout({
          ...this.saleorState.checkout,
          lines: ll,
        });
      }
    }
    if (this.saleorState.checkout?.id) {
      this.jobsManager.addToQueue("cart", "setCartItem");
      return {
        pending: true,
      };
    }
    return {
      pending: false,
    };
  };
  subtractItem = async (variantId: string) => {
    // 1. save in local storage
    this.localStorageManager.subtractItemFromCart(variantId);
    // 2. save online if possible (if checkout id available)
    if (this.saleorState.checkout?.lines) {
      const {
        data,
        error,
      } = await this.apolloClientManager.getRefreshedCheckoutLines(
        this.saleorState.checkout?.lines
      );
      if (error) {
        this.fireError(error, ErrorCartTypes.SET_CART_ITEM);
      } else {
        await this.localStorageManager.getHandler().setCheckout({
          ...(this.saleorState.checkout?._W? this.saleorState.checkout?._W: this.saleorState.checkout),
          lines: data,
        });
      }
    }
    if (this.saleorState.checkout?.id) {
      this.jobsManager.addToQueue("cart", "setCartItem");
      return {
        pending: true,
      };
    }
    return {
      pending: false,
    };
  };
  updateItem = async (variantId: string, quantity: number) => {
    // 1. save in local storage
    this.localStorageManager.updateItemInCart(variantId, quantity);
    // 2. save online if possible (if checkout id available)
    if (this.saleorState.checkout?.lines) {
      const {
        data,
        error,
      } = await this.apolloClientManager.getRefreshedCheckoutLines(
        this.saleorState.checkout?.lines
      );
      if (error) {
        this.fireError(error, ErrorCartTypes.SET_CART_ITEM);
      } else {
        await this.localStorageManager.getHandler().setCheckout({
          ...(this.saleorState.checkout?._W? this.saleorState.checkout?._W: this.saleorState.checkout),
          lines: data,
        });
      }
    }
    if (this.saleorState.checkout?.id) {
      const { data, error } = await this.apolloClientManager.setCartItem(this.saleorState.checkout);
      const ll = data?.lines?.filter(line => this?.saleorState?.checkout?.lines?.find(l => l?.variant?.id === line?.variant?.id));
      const wrappedItem = {
        item: {
          ...this.saleorState.checkout,
          availablePaymentGateways: data?.availablePaymentGateways,
          availableShippingMethods: data?.availableShippingMethods,
          lines: ll,
          promoCodeDiscount: data?.promoCodeDiscount,
          shippingMethod: data?.shippingMethod,
        },
        timestamp: Date.now(),
      };
      await this.localStorageManager.getHandler().setCheckout(wrappedItem?.item);
      if (error) {
        this.localStorageManager.updateItemInCart(variantId, quantity - 1);
        if (this.saleorState.checkout.lines) {
          const {
            data,
            error,
          } = await this.apolloClientManager.getRefreshedCheckoutLines(
            this.saleorState.checkout?.lines
          );
          if (error) {
            this.fireError(error, ErrorCartTypes.SET_CART_ITEM);
          } else {
            await this.localStorageManager.getHandler().setCheckout({
              ...(this.saleorState.checkout?._W ? this.saleorState.checkout?._W : this.saleorState.checkout),
              lines: data,
            });
          }
        }
        return { error };
      } else if (data) {
        return { data, quantity };
      }
    }
    return {
      pending: false,
    };
  };
  //method to update cart with latest checkout
  updateCart = async () => {
    if(this.saleorState.checkout){
      this.jobsManager.addToQueue("cart", "setCartItem");
    }
  }
}