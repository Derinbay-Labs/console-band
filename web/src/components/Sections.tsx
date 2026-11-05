import { CommandBlock } from "./CommandBlock";
import { Band } from "./Band";
import { Brand } from "./Brand";
import { Icon, LabsMark } from "./icons";
import { Stage } from "./Stage";
import { GIT_COMMANDS, REPO_URL } from "@/content";
import type { Copy } from "@/content/types";
import { inlineCode } from "@/lib/inline";
import { labsUrl } from "@/lib/locale";

export function Hero({ t }: { t: Copy }) {
  return (
    <section className="hero" id="hero" aria-labelledby="h1">
      <div className="wrap o2-head">
        <h1 id="h1">{t.h1}</h1>
        <p className="lead">{t.lead}</p>
      </div>
      <Stage t={t} />
    </section>
  );
}

export function Spec({ t }: { t: Copy }) {
  return (
    <section className="spec" aria-labelledby="spec-h">
      <div className="wrap">
        <h2 className="sr-only" id="spec-h">
          {t.specH}
        </h2>
        <dl>
          {t.spec.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function Features({ t }: { t: Copy }) {
  const tile = (keys: string, scene: "agents" | "mid" | "cool") => (
    <Band className="tile" scene={scene} keys={keys.split(",")} full />
  );
  const visuals = [
    <div className="tile-stack" key="a">
      {tile("turn,agents,agent0,agent1,agent2", "agents")}
    </div>,
    <div key="b">
      {tile("gate", "mid")}
      <ul className="glyphs">
        {t.gl.map(([g, tone, word]) => (
          <li key={word}>
            <b className={tone} aria-hidden="true">
              {g}
            </b>
            {word}
          </li>
        ))}
      </ul>
    </div>,
    <div key="c">{tile("log0,log1,log2", "cool")}</div>,
  ];
  return (
    <section className="section" id="features" aria-labelledby="feat-h">
      <div className="wrap">
        <div className="sec-head">
          <h2 id="feat-h">{t.featH}</h2>
          <p>{t.featP}</p>
        </div>
        <div className="closeups">
          {t.feats.map(([h, d], i) => (
            <article className="cu" key={h}>
              <div className="plinth">{visuals[i]}</div>
              <div>
                <h3>{h}</h3>
                <p>{d}</p>
              </div>
            </article>
          ))}
        </div>
        <dl className="also">
          {t.also.map(([icon, h, d]) => (
            <div key={h}>
              <Icon name={icon} />
              <dt>{h}</dt>
              <dd>{d}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function How({ t }: { t: Copy }) {
  return (
    <section className="section" id="how" aria-labelledby="how-h" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="sec-head">
          <h2 id="how-h">{t.howH}</h2>
          <p>{t.howP}</p>
        </div>
        <ol className="steps">
          {t.steps.map(([h, d], i) => (
            <li className="step" key={h}>
              <h3>{h}</h3>
              <p>{d}</p>
              <div className="chipline">
                <Icon name="terminal" />
                <code>{t.stepChips[i]}</code>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Privacy({ t }: { t: Copy }) {
  return (
    <section
      className="section trust"
      id="privacy"
      aria-labelledby="trust-h"
      style={{ paddingTop: 0 }}
    >
      <div className="wrap trust-grid">
        <div className="trust-lead">
          <h2 id="trust-h">{t.trustH}</h2>
          <p>{t.trustP}</p>
        </div>
        <dl className="ledger">
          {t.ledger.map(([icon, k, v], n) => (
            <div key={k}>
              <dt>
                <Icon name={icon} />
                {k}
              </dt>
              <dd>
                {v}
                {n === 0 ? (
                  <span className="cmds">
                    {GIT_COMMANDS.map((c) => (
                      <code key={c}>{c}</code>
                    ))}
                  </span>
                ) : null}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function Faq({ t }: { t: Copy }) {
  return (
    <section className="section" id="faq" aria-labelledby="faq-h" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="sec-head">
          <h2 id="faq-h">{t.faqH}</h2>
        </div>
        <div className="faq">
          {t.faq.map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <Icon name="plus" />
              </summary>
              <p>{inlineCode(a)}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Final({ t }: { t: Copy }) {
  return (
    <section className="final" id="get" aria-labelledby="final-h">
      <div className="wrap">
        <h2 id="final-h">{t.finalH}</h2>
        <p className="lead">{t.finalP}</p>
        <div className="final-act">
          <CommandBlock labels={t}>
            <div className="cta-row">
              <a className="btn btn-ghost btn-sm" href={REPO_URL}>
                {t.ghBtn}
                <Icon name="ext" />
              </a>
              <span className="note">{t.cmdNote}</span>
            </div>
          </CommandBlock>
        </div>
        <div className="peek" aria-hidden="true">
          <div className="device">
            <div className="term o2-term">
              <div className="term-body">
                <Band scene="agents" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer({ t }: { t: Copy }) {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <Brand />
            <p>{t.footTag}</p>
          </div>
          <nav aria-label={t.footNav}>
            <ul>
              {t.footLinks.map(([label, href]) => (
                <li key={label}>
                  <a href={href}>{label}</a>
                </li>
              ))}
            </ul>
          </nav>
          <a className="labs" href={labsUrl(t.lang)} hrefLang={t.lang}>
            <span className="labs-mark">
              <LabsMark />
            </span>
            <span className="labs-text">
              <span>
                {t.labs}
                <Icon name="arrow" />
              </span>
              <small>{t.labsSmall}</small>
            </span>
          </a>
        </div>
        <div className="foot-bottom">
          <span>{t.copyright}</span>
          <span>{t.footNote}</span>
        </div>
      </div>
    </footer>
  );
}
