import { packages, studio } from "../data/studio";

export function initStudio() {
  const money = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);
  const plans = Object.fromEntries(packages.map((p) => [p.id, p]));
  const $ = <T extends Element = HTMLElement>(s: string) =>
    document.querySelector<T>(s);
  const all = <T extends Element = HTMLElement>(s: string) => [
    ...document.querySelectorAll<T>(s),
  ];
  const query = new URLSearchParams(location.search);
  const priceToggle = $<HTMLInputElement>("#veteran-toggle");
  const contactToggle = $<HTMLInputElement>("#contact-veteran");
  const packageSelect = $<HTMLSelectElement>("#project-package");
  let veteran = query.get("veteran") === "true";
  const estimate = () => {
    const selected = packageSelect ? plans[packageSelect.value] : null;
    const area = $("#project-estimate");
    if (area) area.hidden = !selected;
    if (selected) {
      const rate = veteran ? studio.veteranRate : 1;
      const node = $("#estimate-price");
      if (node)
        node.textContent = `${money(selected.price * rate)} ${selected.monthly ? "setup" : "one time"}${selected.monthly ? ` + ${money(selected.monthly * rate)}/month` : ""}${veteran ? " · veteran pricing" : ""}`;
    }
  };
  const refresh = (announce = false) => {
    const rate = veteran ? studio.veteranRate : 1;
    if (priceToggle) priceToggle.checked = veteran;
    if (contactToggle) contactToggle.checked = veteran;
    all("[data-base-price]").forEach(
      (el) => (el.textContent = money(Number(el.dataset.basePrice) * rate)),
    );
    all("[data-saving-base]").forEach(
      (el) =>
        (el.textContent = veteran
          ? `Veteran savings: ${money(Number(el.dataset.savingBase) * 0.15)}${el.closest("[data-plan=deluxe]") ? " + $15/month" : ""}`
          : ""),
    );
    if (packageSelect)
      packages.forEach((plan) => {
        const option = packageSelect.querySelector<HTMLOptionElement>(
          `option[value="${plan.id}"]`,
        );
        if (option)
          option.textContent = `${plan.name} — ${money(plan.price * rate)} ${plan.monthly ? `setup + ${money(plan.monthly * rate)}/month` : "one time"}`;
      });
    all<HTMLAnchorElement>("[data-select-plan]").forEach((el) => {
      if (el.getAttribute("href")?.startsWith("#")) return;
      const url = new URL(el.href);
      url.searchParams.set("package", el.dataset.selectPlan!);
      if (veteran) url.searchParams.set("veteran", "true");
      else url.searchParams.delete("veteran");
      el.href = url.pathname + url.search + url.hash;
    });
    const announcement = $("#pricing-announcement");
    if (announcement && announce)
      announcement.textContent = veteran
        ? "Veteran pricing applied. Basic $255. Professional $595. Deluxe $1,105 setup plus $85 per month."
        : "Standard pricing applied. Basic $300. Professional $700. Deluxe $1,300 setup plus $100 per month.";
    estimate();
  };
  [priceToggle, contactToggle].forEach((el) =>
    el?.addEventListener("change", () => {
      veteran = el.checked;
      refresh(true);
    }),
  );
  if (packageSelect && plans[query.get("package") || ""])
    packageSelect.value = query.get("package")!;
  packageSelect?.addEventListener("change", estimate);
  // Event delegation also reads the updated plan recommendation.
  document.addEventListener("click", (event) => {
    const link = (event.target as Element).closest<HTMLAnchorElement>(
      "[data-select-plan]",
    );
    if (link && packageSelect && plans[link.dataset.selectPlan!]) {
      packageSelect.value = link.dataset.selectPlan!;
      estimate();
    }
  });
  $<HTMLSelectElement>("#business-goal")?.addEventListener(
    "change",
    (event) => {
      const id = (event.target as HTMLSelectElement).value;
      if ($("#recommended-name"))
        $("#recommended-name")!.textContent = plans[id].name;
      const link = $("#recommended-link");
      if (link) link.dataset.selectPlan = id;
      all("[data-plan]").forEach((card) =>
        card.classList.toggle("recommended", card.dataset.plan === id),
      );
      refresh();
    },
  );
  refresh();

  const tabs = all<HTMLButtonElement>("[data-project-tab]");
  const panels = all("[data-project-panel]");
  if (tabs.length) {
    $(".work-section")?.classList.add("portfolio-enhanced");
    const activate = (id: string, focus = false) => {
      tabs.forEach((tab) => {
        const on = tab.dataset.projectTab === id;
        tab.setAttribute("aria-selected", String(on));
        tab.tabIndex = on ? 0 : -1;
        if (on && focus) tab.focus();
      });
      panels.forEach(
        (panel) => (panel.hidden = panel.dataset.projectPanel !== id),
      );
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activate(tab.dataset.projectTab!));
      tab.addEventListener("keydown", (event) => {
        let next = index;
        if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
        else if (event.key === "ArrowLeft")
          next = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = tabs.length - 1;
        else return;
        event.preventDefault();
        activate(tabs[next].dataset.projectTab!, true);
      });
    });
    activate(tabs[0].dataset.projectTab!);
    panels.forEach((panel) => {
      panel
        .querySelectorAll<HTMLButtonElement>("[data-device]")
        .forEach((button) =>
          button.addEventListener("click", () => {
            panel
              .querySelectorAll("[data-device]")
              .forEach((el) =>
                el.setAttribute("aria-pressed", String(el === button)),
              );
            const display =
              panel.querySelector<HTMLElement>(".project-display");
            if (display) display.dataset.deviceView = button.dataset.device;
          }),
        );
      panel.querySelectorAll<HTMLImageElement>("img").forEach((img) =>
        img.addEventListener("error", () => {
          const figure = img.closest("figure");
          if (figure) figure.hidden = true;
          const fallback = panel.querySelector<HTMLElement>(".missing-asset");
          if (fallback) fallback.hidden = false;
        }),
      );
    });
  }
  const menu = $<HTMLDetailsElement>(".mobile-menu");
  menu
    ?.querySelectorAll("a")
    .forEach((link) =>
      link.addEventListener("click", () => (menu.open = false)),
    );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu?.open) {
      menu.open = false;
      menu.querySelector("summary")?.focus();
    }
  });
  document.addEventListener("click", (e) => {
    if (menu?.open && !menu.contains(e.target as Node)) menu.open = false;
  });

  const form = $<HTMLFormElement>("#project-form");
  if (form) {
    form.querySelector<HTMLButtonElement>("button[type=submit]")!.disabled =
      false;
    let draft = "";
    const draftArea = $("#draft-ready")!;
    const clearDraft = () => {
      draftArea.hidden = true;
    };
    form.addEventListener("input", clearDraft);
    form.addEventListener("change", clearDraft);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const field = (name: string) => String(data.get(name) || "").trim();
      const selected = plans[field("package")];
      const rate = veteran ? studio.veteranRate : 1;
      const price = selected
        ? `${money(selected.price * rate)} ${selected.monthly ? "setup" : "one time"}${selected.monthly ? ` + ${money(selected.monthly * rate)}/month` : ""}`
        : "Please help me choose a package.";
      draft = `Hello Albrecht Web Co.,\n\nI’d like to discuss a website project.\n\nName: ${field("name")}\nEmail: ${field("email")}\nBusiness: ${field("business") || "Not specified"}\nPackage: ${selected?.name || "Help me choose"}\nVeteran discount: ${veteran ? "Requested (15%)" : "Not requested"}\nPackage estimate: ${price}\n\nProject details:\n${field("details")}\n\nI understand the project scope and any separate costs will be confirmed before work begins.\n`;
      const href = `mailto:${studio.email}?subject=${encodeURIComponent(`Website project — ${field("business") || field("name")}`)}&body=${encodeURIComponent(draft)}`;
      $<HTMLTextAreaElement>("#draft-text")!.value = draft;
      $<HTMLAnchorElement>("#open-draft")!.href = href;
      $("#form-status")!.textContent =
        `Your draft is ready. Review and send it in your email app. If the app didn’t open, copy the details below and email ${studio.email}.`;
      $("#copy-draft")!.textContent = "Copy project details";
      draftArea.hidden = false;
      location.href = href;
    });
    $("#copy-draft")?.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(draft);
        $("#copy-draft")!.textContent = "Copied";
      } catch {
        const field = $<HTMLTextAreaElement>("#draft-text")!;
        field.focus();
        field.select();
        $("#copy-draft")!.textContent = "Select and copy the draft below";
      }
    });
  }
}
