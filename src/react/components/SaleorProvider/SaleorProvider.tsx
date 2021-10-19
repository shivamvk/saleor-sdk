import React, { useState, useEffect } from "react";
import { ApolloClient, ApolloProvider } from "@apollo/client";

import { SaleorManager } from "../../..";
import { SaleorAPI } from "../../../api";
import { SaleorContext } from "../../context";

import { IProps } from "./types";

const SaleorProvider: React.FC<IProps> = ({
  apolloConfig,
  config,
  children,
  appversion,
  appplatform
}: IProps) => {
  const [context, setContext] = useState<SaleorAPI | null>(null);
  const [client, setClient] = useState<ApolloClient<any> | null>(null);

  const getSaleorApiAndClient = async (manager: SaleorManager) => {
    const { api, apolloClient } = await manager.connect(saleorAPI => {
      if (saleorAPI) {
        setContext({ ...saleorAPI });
      }
    });

    setContext({ ...api });
    setClient(apolloClient);
  };

  useEffect(() => {
    const manager = new SaleorManager(config, apolloConfig, appversion, appplatform);

    getSaleorApiAndClient(manager);
  }, []);

  if (client && context) {
    return (
      <SaleorContext.Provider value={context}>
        <ApolloProvider client={client}>{children}</ApolloProvider>
      </SaleorContext.Provider>
    );
  }
  return null;
};

SaleorProvider.displayName = "SaleorProvider";
export { SaleorProvider };
