import { system } from "@silverbulletmd/silverbullet/syscalls";
import { CodeWidgetContent } from "@silverbulletmd/silverbullet/type/client";

export async function widget(
    bodyText: string,
): Promise<CodeWidgetContent> {
  const config = await system.getConfig("mermaid", {version: "11.10.1"})
  const mermaidVersion = config?.version;
  let mermaidHash : string | undefined = config?.integrity ? `"${config.integrity}"` : `"sha256-BmQmdWDS8X2OTbrwELWK366LV6escyWhHHe0XCTU/Hk="`
  if (config?.integrity_disabled) {
    mermaidHash = undefined;
  }

  let packs: string = "";
  if (config?.icon_packs) {
    for (const pack of config?.icon_packs) {
      packs += `{
        name: "${pack.name}",
        loader: () => fetch("${pack.url}").then(r => r.json()),
      },`;
    }
  }

    return {
        html: `<pre class="mermaid">${bodyText.replaceAll("<", "&lt;")}</pre>`,
        script: `
        loadJsByUrl("https://cdn.jsdelivr.net/npm/mermaid@${mermaidVersion}/dist/mermaid.min.js", ${mermaidHash}).then(() => {
          mermaid.registerIconPacks([${packs}]);
          return mermaid.init();
        }).then(() =>
          loadJsByUrl("https://cdn.jsdelivr.net/npm/svg-pan-zoom@3.6.1/dist/svg-pan-zoom.min.js")
        ).then(() => {
          const svg = document.querySelector(".mermaid svg");
          svg.style.maxWidth = "none";
          svg.setAttribute("width", "100%");
          svg.setAttribute("height", "500");
          svgPanZoom(svg, {
            zoomEnabled: true,
            controlIconsEnabled: true,
            mouseWheelZoomEnabled: true,
            fit: true,
            center: true,
            minZoom: 0.2,
            maxZoom: 20,
          });
          updateHeight();
        });
        document.addEventListener("click", () => {
          api({type: "blur"});
        });
        `,
      };
