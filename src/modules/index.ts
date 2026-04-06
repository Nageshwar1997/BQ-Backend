import { AddressModule } from "./Address.Module";
import { AuthModule } from "./Auth.Module";

export * as BlogModule from "./blog";
export * as MediaModule from "./media";
export * as UserModule from "./user";
export * as ProductModule from "./product";
export * as ReviewModule from "./review";
export * as CartModule from "./cart";
export * as CartProductModule from "./cartProduct";
export * as OrderModule from "./order";
export * as ChatbotModule from "./chatbot";
export * as WebhookModule from "./webhook";

export const Modules = {
  Auth: AuthModule,
  Address: AddressModule,
};
