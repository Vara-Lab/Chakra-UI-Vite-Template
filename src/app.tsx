import "@gear-js/vara-ui/dist/style.css";
import { useAccount, useApi } from "@gear-js/react-hooks";
import { ApiLoader } from "@/components";
import { Header } from "@/components/layout";
import { withProviders } from "@/app/hocs";
import { useWalletSync } from "@/features/wallet/hooks";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Root } from "./Routes";
import { Home } from "./pages/home";
import { Examples } from "./Routes";

import { ROUTES } from "./app/consts";

function Component() {
  useWalletSync();
  const routes = createBrowserRouter([
    {
      path: ROUTES.HOME,
      element: <Root />,
      errorElement: <h2>Unexpected error!</h2>,
      children: [
        {
          errorElement: <h2>Unexpected error!</h2>,
          children: [
            {
              index: true,
              element: <Home />
            },
            {
              path: ROUTES.EXAMPLES,
              element: <Examples />
            }
          ]
        }
      ]
    }
  ]);
  

  return (
    <RouterProvider router={routes} />
  );
}

export const App = withProviders(Component);
