declare module "*.css" {
  const content: string;
  export default content;
}

declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY?: string;
  }
}
