declare module "midtrans-client" {
  class Snap {
    constructor(config: {
      clientKey: string;
      isProduction: boolean;
      serverKey: string;
    });
    createTransactionToken(parameter: any): Promise<string>;
    createTransaction(parameter: any): Promise<any>;
  }
}
