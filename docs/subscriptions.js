import { themes } from "./taxonomy.js";
import { element } from "./ui.js";

const copy = {
  all: ["All themes", "全部专题"],
  loading: ["Loading recent entries…", "正在加载近期条目…"],
  unavailable: ["Recent entries could not be loaded.", "近期条目加载失败。"],
  empty: ["New entries will appear here after the next catalog update.", "本专题下一次有新条目入库时将在这里显示。"],
  copied: ["RSS address copied.", "已复制 RSS 地址。"],
  select: ["RSS address selected. Use your device’s copy command.", "RSS 地址已选中，可用设备的复制命令复制。"],
};

export function mountSubscriptions(local) {
  const select = document.getElementById("feed-theme");
  const address = document.getElementById("rss-address");
  const feedback = document.getElementById("feed-feedback");
  const recent = document.getElementById("recent-entries");
  const fromUrl = new URLSearchParams(location.search).get("theme");
  let theme = Object.hasOwn(themes, fromUrl) ? fromUrl : "all";
  let updates;

  function render() {
    select.replaceChildren(
      new Option(local(copy.all), "all"),
      ...Object.entries(themes).map(([key, value]) => new Option(local(value.name), key)),
    );
    select.value = theme;
    address.value = new URL(`./feeds/${theme}.xml`, location.href).href;
    document.getElementById("rss-link").href = address.value;
    const email = new URL("https://feedmail.org/subscriptions/new");
    email.searchParams.set("url", address.value);
    document.getElementById("feedmail-link").href = email.href;
    feedback.textContent = "";

    const entries = updates?.filter((entry) => theme === "all" || entry.feedSection === theme).slice(0, 5);
    if (!entries?.length) {
      const status = updates === undefined ? "loading" : updates === null ? "unavailable" : "empty";
      recent.replaceChildren(element("p", "feed-note", local(copy[status])));
      return;
    }
    const list = element("ul", "recent-list");
    for (const entry of entries) {
      const row = element("li");
      const link = element("a", "", entry.title);
      link.href = entry.url;
      const date = element("time", "", entry.addedAt.slice(0, 10));
      date.dateTime = entry.addedAt;
      row.append(date, link);
      list.append(row);
    }
    recent.replaceChildren(list);
  }

  select.addEventListener("change", () => {
    theme = select.value;
    render();
  });
  document.getElementById("copy-feed").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(address.value);
      feedback.textContent = local(copy.copied);
    } catch {
      address.select();
      feedback.textContent = local(copy.select);
    }
  });
  fetch("./feeds/updates.json").then(async (response) => {
    if (!response.ok) throw new Error(`Feed updates HTTP ${response.status}`);
    updates = await response.json();
  }).catch(() => {
    updates = null;
  }).then(render);
  return render;
}
