import { ApolloLink } from "@apollo/client";
import { BatchHttpLink } from "@apollo/client/link/batch-http";
import { RetryLink } from "@apollo/client/link/retry";
import { extractFiles } from 'extract-files';
import { createUploadLink } from 'apollo-upload-client';
import { authLink, invalidTokenLinkWithTokenHandler } from "./auth";

interface SaleorLinksConfig {
  /**
   * Url of the Saleor GraphQL API.
   */
  apiUrl: string;
  /**
   * Callback called when token expiration error occured in Saleor API response.
   */
  tokenExpirationCallback: () => void;
}

/**
 * Creates list of links for Apollo client.
 * @param linksConfig Configuration for created links.
 */
export const createSaleorLinks = ({
  apiUrl,
  tokenExpirationCallback,
}: SaleorLinksConfig) => {
  const invalidTokenLink = invalidTokenLinkWithTokenHandler(
    tokenExpirationCallback
  );

  const batchAndUploadLink = ApolloLink.split(
    operation => extractFiles(operation).files.size > 0,
    createUploadLink({
      credentials: "include",
      uri: apiUrl,
    }),
    new BatchHttpLink({ credentials: "include", uri: apiUrl })
  );

  return [
    invalidTokenLink,
    authLink,
    new RetryLink(),
    batchAndUploadLink
  ];
};
