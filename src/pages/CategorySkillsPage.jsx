import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Catalog, Auth } from "../api";
import { useAuth } from "../auth/AuthContext";
import toast from "react-hot-toast";
import { makeSafeRx } from "../utils/strings"; // 👈 use your helper

export default function CategorySkillsPage() {
  const { idOrSlug } = useParams();
  const { refreshUser, user } = useAuth();

  const [category, setCategory] = useState(null);
  const [skills, setSkills] = useState([]);
  const [busyKey, setBusyKey] = useState(null);
  const [q, setQ] = useState("");
  const [rates, setRates] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const data = await Catalog.categorySkills(idOrSlug, { active: true, limit: 100 });
        const list = data.items || data || [];
        setSkills(list);
        const nextRates = {};
        for (const s of list) nextRates[s.slug || s._id] = s.defaultCreditsPerHour ?? 0;
        setRates(nextRates);
        setCategory((prev) => prev ?? { name: "Category", slug: idOrSlug });
      } catch (error) {
        console.error("Failed to load skills.", error);
        toast.error("Failed to load skills.");
      }
    })();
  }, [idOrSlug]);

  useEffect(() => {
    (async () => {
      try {
        const all = await Catalog.categories({ active: true, limit: 100 });
        const list = all.items || all || [];
        const found = list.find(
          (c) => c.slug === idOrSlug || c._id === idOrSlug
        );
        if (found) setCategory(found);
      } catch (error) {
        console.error("Failed to load category.", error);
        toast.error("Failed to load category.");
      }
    })();
  }, [idOrSlug]);

  const skillKey = (s) => s.slug || s._id;

  const teachSet = useMemo(
    () => new Set((user?.skillsToTeach || []).map((t) => t?.skillId?.slug || String(t?.skillId || ""))),
    [user]
  );
  const learnSet = useMemo(
    () => new Set((user?.skillsToLearn || []).map((l) => l?.skillId?.slug || String(l?.skillId || ""))),
    [user]
  );

  // 👇 SAFE filter (no crash on special chars)
  const filtered = useMemo(() => {
    const t = q.trim();
    if (!t) return skills;
    const rx = makeSafeRx(t);
    if (!rx) return skills;
    return skills.filter((s) => rx.test(s?.name || ""));
  }, [skills, q]);

  function onRateChange(key, value) {
    if (value === "") { setRates((r) => ({ ...r, [key]: "" })); return; }
    const n = Number(value);
    if (Number.isNaN(n) || n < 0 || n > 9999) return;
    setRates((r) => ({ ...r, [key]: n }));
  }

  async function addTeach(skill) {
    const key = skillKey(skill);
    if (busyKey) return;
    if (teachSet.has(key)) return toast("You already teach this skill.", { icon: "ℹ️" });

    setBusyKey(key);
    try {
      const credit = rates[key];
      const payload =
        credit === undefined || credit === skill.defaultCreditsPerHour
          ? { skill: key }
          : { skill: key, creditsPerHour: Number(credit) };
      await Auth.addTeach(payload);
      toast.success(`Added "${skill.name}" to Teach.`);
      await refreshUser();
    } catch (e) {
      toast.error(e?.response?.data?.error || "Failed to add to Teach.");
    } finally {
      setBusyKey(null);
    }
  }

  async function addLearn(skill) {
    const key = skillKey(skill);
    if (busyKey) return;
    if (learnSet.has(key)) return toast("This skill is already in your Learn list.", { icon: "ℹ️" });

    setBusyKey(key);
    try {
      await Auth.addLearn({ skill: key });
      toast.success(`Added "${skill.name}" to Learn.`);
      await refreshUser();
    } catch (e) {
      toast.error(e?.response?.data?.error || "Failed to add to Learn.");
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className="grid gap-6">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">{category?.name || "Skills"}</h3>
          <Link to="/catalog" className="btn-ghost">
            ← Back
          </Link>
        </div>

        <div className="card-content grid gap-4">
          <div className="field-row">
            <label htmlFor="q" className="label">
              Search skills
            </label>
            <div className="flex items-center gap-2">
              <input
                id="q" name="q" type="text" className="input"
                placeholder="Type to filter…" value={q}
                onChange={(e) => setQ(e.target.value)} autoComplete="off"
              />
              {q && <button className="btn-ghost" onClick={() => setQ("")}>Clear</button>}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="subtle">No skills found.</div>
          ) : (
            <ul className="list">
              {filtered.map((s) => {
                const key = skillKey(s);
                const isBusy = busyKey === key;
                const current = rates[key] ?? s.defaultCreditsPerHour ?? 0;
                return (
                  <li key={key} className="row">
                    <div className="row-left">
                      <div className="avatar">
                        {(s.name || "?").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {s.name}
                        </div>
                        {s.description && (
                          <div className="subtle">{s.description}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <label htmlFor={`rate-${key}`} className="label">cr/hr</label>
                      <input
                        id={`rate-${key}`} type="number" min={0} max={9999}
                        className="input w-24" value={current}
                        onChange={(e) => onRateChange(key, e.target.value)}
                        disabled={isBusy}
                      />
                      <button className="btn-outline" disabled={isBusy} onClick={() => addTeach(s)} aria-busy={isBusy}>
                        Teach
                      </button>
                      <button className="btn-primary" disabled={isBusy} onClick={() => addLearn(s)} aria-busy={isBusy}>
                        Learn
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
