import { AppRouter } from "@/app/router";
import { useSessionBootstrap } from "@/features/auth/use-session-bootstrap";

function App() {
  useSessionBootstrap();
  return <AppRouter />;
}

export default App;