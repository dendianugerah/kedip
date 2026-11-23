import "./index.css";

const root = document.getElementById("root") as HTMLElement;
const params = new URLSearchParams(window.location.search);

if (params.get("window") === "break" && params.get("primary") === "false") {
  root.className = "break-surface";
} else {
  void import("./App").then(({ mountApp }) => mountApp(root, params.get("window")));
}
