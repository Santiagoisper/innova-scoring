let appPromise: Promise<any> | null = null;

async function getApp() {
  if (!appPromise) {
    appPromise = import("../dist/app.cjs").then((mod: any) => {
      const createApp = mod?.createApp || mod?.default?.createApp;
      if (typeof createApp !== "function") {
        throw new Error("createApp export not found in dist/app.cjs");
      }
      return createApp().then(({ app }: any) => app);
    });
  }
  return appPromise;
}

export default async function handler(req: any, res: any) {
  const app = await getApp();
  return app(req, res);
}

export const config = {
  maxDuration: 60,
};
