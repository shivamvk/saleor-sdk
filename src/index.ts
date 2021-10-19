import { ApolloClient } from "@apollo/client";

import { SaleorAPI } from "./api";
import { ConfigInput, ApolloConfigInput } from "./types";
import APIProxy from "./api/APIProxy";
import { createSaleorLinks } from "./links";
import { createSaleorClient } from "./client";
import { createSaleorCache } from "./cache";

interface CreateAPIResult {
  api: SaleorAPI;
  apiProxy: APIProxy;
  apolloClient: ApolloClient<any>;
}

interface ConnectResult {
  /**
   * Saleor API.
   */
  api: SaleorAPI;
  /**
   * Apollo client used by Saleor API.
   */
  apolloClient: ApolloClient<any>;
}

export class SaleorManager {
  private readonly config: ConfigInput;

  private readonly apolloConfig: ApolloConfigInput;

  private apiProxy?: APIProxy;

  private api?: SaleorAPI;

  private apolloClient?: ApolloClient<any>;

  private tokenRefreshing: boolean = false;

  private apiChangeListener?: (api?: SaleorAPI) => any;

  private appversion?: string;
  private appplatform?: string;

  constructor(config: ConfigInput, apolloConfig?: ApolloConfigInput, appversion?: string, appplatform?: string) {
    this.config = config;
    this.appversion = appversion;
    this.appplatform = appplatform;
    this.apolloConfig = {
      persistCache: true,
      ...apolloConfig,
    };
  }

  /**
   * Use this method to obtain current API and optionally listen to its update on occurred changes within it.
   * @param apiChangeListener Function called to get an API and called on every API update.
   */
  async connect(
    apiChangeListener?: (api?: SaleorAPI) => any
  ): Promise<ConnectResult> {
    if (!this.api || !this.apiProxy || !this.apolloClient) {
      const { api, apiProxy, apolloClient } = await SaleorManager.createApi(
        this.config,
        this.apolloConfig,
        this.tokenExpirationCallback,
        this.onSaleorApiChange,
        this.appplatform,
        this.appversion
      );

      this.api = api;
      this.apiProxy = apiProxy;
      this.apolloClient = apolloClient;
    }

    if (apiChangeListener) {
      this.apiChangeListener = apiChangeListener;
    }

    return { api: this.api, apolloClient: this.apolloClient };
  }

  private static createApi = async (
    config: ConfigInput,
    apolloConfig: ApolloConfigInput,
    tokenExpirationCallback: () => void,
    onSaleorApiChange: () => void,
    appplatform?: string,
    appversion?: string
  ): Promise<CreateAPIResult> => {
    const { cache, persistCache, links, client, options } = apolloConfig;

    const saleorCache =
      !client && cache
        ? cache
        : await createSaleorCache({
            persistCache: !!persistCache,
          });
    const saleorLinks =
      !client && links
        ? links
        : createSaleorLinks({
            apiUrl: config.apiUrl,
            tokenExpirationCallback,
            appplatform,
            appversion
          });
    const apolloClient =
      client || createSaleorClient(saleorCache, saleorLinks, options);

    const apiProxy = new APIProxy(apolloClient);
    const api = await SaleorAPI.create(
      apolloClient,
      apiProxy,
      config,
      onSaleorApiChange
    );

    return { api, apiProxy, apolloClient };
  };

  private tokenExpirationCallback = async () => {
    if (!this.tokenRefreshing) {
      this.tokenRefreshing = true;

      const tokenRefreshResult = await this.api?.auth.refreshSignInToken();
      if (!tokenRefreshResult?.data?.token || tokenRefreshResult?.dataError) {
        await this.api?.auth.signOut();
      }

      this.tokenRefreshing = false;
    }
  };

  private onSaleorApiChange = () => {
    if (this.apiChangeListener) {
      this.apiChangeListener(this.api);
    }
  };
}

export * from "./auth";
export * from "./cache";
export * from "./links";
export * from "./client";
export * from "./gqlTypes/globalTypes";

// FIXME: It's imported here because it's not a monorepo yet
/* eslint-disable import/no-cycle */
export * from "./react";
/* eslint-enable */
