/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AccountRegisterInputV2 } from "./../../gqlTypes/globalTypes";

// ====================================================
// GraphQL mutation operation: AccountRegisterV2
// ====================================================

export interface AccountRegisterV2_accountRegisterV2_user_avatar {
  __typename: "Image";
  /**
   * The URL of the image.
   */
  url: string;
}

export interface AccountRegisterV2_accountRegisterV2_user_metadata {
  __typename: "MetadataItem";
  /**
   * Key of a metadata item.
   */
  key: string;
  /**
   * Value of a metadata item.
   */
  value: string;
}

export interface AccountRegisterV2_accountRegisterV2_user_defaultShippingAddress_country {
  __typename: "CountryDisplay";
  /**
   * Country code.
   */
  code: string;
  /**
   * Country name.
   */
  country: string;
}

export interface AccountRegisterV2_accountRegisterV2_user_defaultShippingAddress {
  __typename: "Address";
  /**
   * The ID of the object.
   */
  id: string;
  firstName: string;
  lastName: string;
  companyName: string;
  streetAddress1: string;
  streetAddress2: string;
  city: string;
  postalCode: string;
  /**
   * Shop's default country.
   */
  country: AccountRegisterV2_accountRegisterV2_user_defaultShippingAddress_country;
  countryArea: string;
  phone: string | null;
  /**
   * Address is user's default billing address.
   */
  isDefaultBillingAddress: boolean | null;
  /**
   * Address is user's default shipping address.
   */
  isDefaultShippingAddress: boolean | null;
}

export interface AccountRegisterV2_accountRegisterV2_user_defaultBillingAddress_country {
  __typename: "CountryDisplay";
  /**
   * Country code.
   */
  code: string;
  /**
   * Country name.
   */
  country: string;
}

export interface AccountRegisterV2_accountRegisterV2_user_defaultBillingAddress {
  __typename: "Address";
  /**
   * The ID of the object.
   */
  id: string;
  firstName: string;
  lastName: string;
  companyName: string;
  streetAddress1: string;
  streetAddress2: string;
  city: string;
  postalCode: string;
  /**
   * Shop's default country.
   */
  country: AccountRegisterV2_accountRegisterV2_user_defaultBillingAddress_country;
  countryArea: string;
  phone: string | null;
  /**
   * Address is user's default billing address.
   */
  isDefaultBillingAddress: boolean | null;
  /**
   * Address is user's default shipping address.
   */
  isDefaultShippingAddress: boolean | null;
}

export interface AccountRegisterV2_accountRegisterV2_user_addresses_country {
  __typename: "CountryDisplay";
  /**
   * Country code.
   */
  code: string;
  /**
   * Country name.
   */
  country: string;
}

export interface AccountRegisterV2_accountRegisterV2_user_addresses {
  __typename: "Address";
  /**
   * The ID of the object.
   */
  id: string;
  firstName: string;
  lastName: string;
  companyName: string;
  streetAddress1: string;
  streetAddress2: string;
  city: string;
  postalCode: string;
  /**
   * Shop's default country.
   */
  country: AccountRegisterV2_accountRegisterV2_user_addresses_country;
  countryArea: string;
  phone: string | null;
  /**
   * Address is user's default billing address.
   */
  isDefaultBillingAddress: boolean | null;
  /**
   * Address is user's default shipping address.
   */
  isDefaultShippingAddress: boolean | null;
}

export interface AccountRegisterV2_accountRegisterV2_user {
  __typename: "User";
  /**
   * The ID of the object.
   */
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isStaff: boolean;
  avatar: AccountRegisterV2_accountRegisterV2_user_avatar | null;
  /**
   * List of public metadata items. Can be accessed without permissions.
   */
  metadata: (AccountRegisterV2_accountRegisterV2_user_metadata | null)[];
  defaultShippingAddress: AccountRegisterV2_accountRegisterV2_user_defaultShippingAddress | null;
  defaultBillingAddress: AccountRegisterV2_accountRegisterV2_user_defaultBillingAddress | null;
  /**
   * List of all user's addresses.
   */
  addresses: (AccountRegisterV2_accountRegisterV2_user_addresses | null)[] | null;
}

export interface AccountRegisterV2_accountRegisterV2_accountErrors {
  __typename: "AccountError";
  /**
   * Name of a field that caused the error. A value of `null` indicates that the error isn't associated with a particular field.
   */
  field: string | null;
  /**
   * The error message.
   */
  message: string | null;
}

export interface AccountRegisterV2_accountRegisterV2_errors {
  __typename: "Error";
  /**
   * Name of a field that caused the error. A value of `null` indicates that the error isn't associated with a particular field.
   */
  field: string | null;
  /**
   * The error message.
   */
  message: string | null;
}

export interface AccountRegisterV2_accountRegisterV2 {
  __typename: "AccountRegisterV2";
  /**
   * Informs whether users is new.
   */
  isNewUser: boolean | null;
  /**
   * Informs whether users is active.
   */
  isActiveUser: boolean | null;
  user: AccountRegisterV2_accountRegisterV2_user | null;
  accountErrors: AccountRegisterV2_accountRegisterV2_accountErrors[];
  /**
   * List of errors that occurred executing the mutation.
   */
  errors: AccountRegisterV2_accountRegisterV2_errors[];
}

export interface AccountRegisterV2 {
  /**
   * Register a new user with phone and email.
   */
  accountRegisterV2: AccountRegisterV2_accountRegisterV2 | null;
}

export interface AccountRegisterV2Variables {
  input: AccountRegisterInputV2;
}
