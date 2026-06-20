import Callout from "./components/Callout.astro";
import MissionBox from "./components/MissionBox.astro";
import AskBox from "./components/AskBox.astro";
import Sources from "./components/Sources.astro";
import Kicker from "./components/Kicker.astro";
import Nav from "./components/Nav.astro";
import CompareCards from "./components/CompareCards.astro";
import Quiz from "./components/Quiz.astro";

/**
 * The Catalog — the single source of truth for the Components a Lesson may use.
 * These definitions both validate the build (a Lesson referencing an unknown
 * Component fails) and are the basis for the Pedagogo-facing guide. The map is
 * spread into the MDX render so every Component is available globally, without
 * an `import` in the Aula.
 */
export const catalog = {
  Callout,
  MissionBox,
  AskBox,
  Sources,
  Kicker,
  Nav,
  CompareCards,
  Quiz,
};
