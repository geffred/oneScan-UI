/* eslint-disable react/prop-types */
import React, { useState, useMemo, useCallback } from "react";
import {
  Package,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Truck,
  XCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  Hash,
  FileText,
  MessageSquare,
} from "lucide-react";
import "./CommandesCabinet.css";

const COMMANDES_PAR_PAGE = 8;

const STATUT_MAP = {
  EN_ATTENTE: { text: "En attente", cls: "en-attente", Icon: Clock },
  EN_COURS: { text: "En cours", cls: "en-cours", Icon: AlertCircle },
  TERMINEE: { text: "Terminée", cls: "termine", Icon: CheckCircle },
  EXPEDIEE: { text: "Expédiée", cls: "livre", Icon: Truck },
  ANNULEE: { text: "Annulée", cls: "annule", Icon: XCircle },
};

const DATE_OPTIONS = [
  { value: "TOUS", label: "Toutes les dates" },
  { value: "AUJOURD_HUI", label: "Aujourd'hui" },
  { value: "CETTE_SEMAINE", label: "Cette semaine" },
  { value: "CE_MOIS", label: "Ce mois" },
  { value: "CETTE_ANNEE", label: "Cette année" },
];

// ── Sidebar ──────────────────────────────────────────────────────────────────
const FilterSidebar = React.memo(
  ({
    search,
    filtreDate,
    filtreStatut,
    onSearch,
    onDate,
    onStatut,
    onClear,
    total,
    filtered,
  }) => {
    const hasFilters = search || filtreDate !== "TOUS" || filtreStatut;
    return (
      <aside className="cc-sidebar">
        <div className="cc-sb-head">
          <SlidersHorizontal size={15} />
          <span>Filtres</span>
        </div>

        <div className="cc-sb-block">
          <label>Recherche</label>
          <div className="cc-sb-search">
            <Search size={13} />
            <input
              type="text"
              placeholder="Réf. patient, appareil…"
              value={search}
              onChange={onSearch}
            />
            {search && (
              <button onClick={() => onSearch({ target: { value: "" } })}>
                <X size={11} />
              </button>
            )}
          </div>
        </div>

        <div className="cc-sb-block">
          <label>Période</label>
          <select value={filtreDate} onChange={onDate}>
            {DATE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="cc-sb-block">
          <label>Statut</label>
          <div className="cc-statut-pills">
            <button
              className={`cc-spill all${!filtreStatut ? " active" : ""}`}
              onClick={() => onStatut("")}
            >
              Tous
            </button>
            {Object.entries(STATUT_MAP).map(([key, val]) => (
              <button
                key={key}
                className={`cc-spill ${val.cls}${filtreStatut === key ? " active" : ""}`}
                onClick={() => onStatut(filtreStatut === key ? "" : key)}
              >
                <val.Icon size={10} />
                {val.text}
              </button>
            ))}
          </div>
        </div>

        {hasFilters && (
          <button className="cc-sb-clear" onClick={onClear}>
            <X size={11} />
            Effacer les filtres
          </button>
        )}

        <div className="cc-sb-badge">
          <span className="cc-sb-n">{filtered}</span>
          <span>
            / {total} commande{total > 1 ? "s" : ""}
          </span>
        </div>
      </aside>
    );
  },
);
FilterSidebar.displayName = "FilterSidebar";

// ── Card ─────────────────────────────────────────────────────────────────────
const CommandeCard = React.memo(({ commande }) => {
  const statut = STATUT_MAP[commande.statut] || STATUT_MAP.EN_ATTENTE;
  const StatutIcon = statut.Icon;
  const fmtDate = (d) =>
    new Date(d).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const isUrgent =
    commande.dateEcheance &&
    commande.statut !== "TERMINEE" &&
    commande.statut !== "EXPEDIEE" &&
    commande.statut !== "ANNULEE" &&
    new Date(commande.dateEcheance) - new Date() < 1000 * 60 * 60 * 48;

  return (
    <div className={`cc-card${isUrgent ? " urgent" : ""}`}>
      <div className="cc-card-top">
        <div className="cc-card-id">
          <span className="cc-ref">{commande.refPatient}</span>
          <span className="cc-platform">{commande.plateforme}</span>
        </div>
        <div className={`cc-badge ${statut.cls}`}>
          <StatutIcon size={11} />
          {statut.text}
        </div>
      </div>

      <div className="cc-card-chips">
        <span className="cc-chip">
          <Calendar size={11} />
          {fmtDate(commande.dateReception)}
        </span>
        {commande.dateEcheance && (
          <span className={`cc-chip${isUrgent ? " chip-urgent" : ""}`}>
            <Clock size={11} />
            Échéance : {fmtDate(commande.dateEcheance)}
          </span>
        )}
        {commande.typeAppareil && (
          <span className="cc-chip">
            <Package size={11} />
            {commande.typeAppareil}
          </span>
        )}
        <span className="cc-chip mono">
          <Hash size={11} />#{commande.id}
        </span>
      </div>

      {commande.details && (
        <div className="cc-card-note blue">
          <FileText size={11} />
          <p>{commande.details}</p>
        </div>
      )}
      {commande.commentaire && (
        <div className="cc-card-note amber">
          <MessageSquare size={11} />
          <p>
            <strong>Note : </strong>
            {commande.commentaire}
          </p>
        </div>
      )}
    </div>
  );
});
CommandeCard.displayName = "CommandeCard";

// ── Main ─────────────────────────────────────────────────────────────────────
const CommandesCabinet = ({
  commandes = [],
  loading = false,
  error = null,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filtreDate, setFiltreDate] = useState("TOUS");
  const [filtreReference, setFiltreReference] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("");
  const [mobileSidebar, setMobileSidebar] = useState(false);

  const filtrerParDate = useCallback((list, filtre) => {
    const now = new Date();
    if (filtre === "AUJOURD_HUI") {
      const t = new Date();
      t.setHours(0, 0, 0, 0);
      return list.filter((c) => {
        const d = new Date(c.dateReception);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === t.getTime();
      });
    }
    if (filtre === "CETTE_SEMAINE") {
      const s = new Date(now);
      s.setDate(now.getDate() - now.getDay());
      s.setHours(0, 0, 0, 0);
      return list.filter((c) => new Date(c.dateReception) >= s);
    }
    if (filtre === "CE_MOIS") {
      const s = new Date(now.getFullYear(), now.getMonth(), 1);
      return list.filter((c) => new Date(c.dateReception) >= s);
    }
    if (filtre === "CETTE_ANNEE") {
      const s = new Date(now.getFullYear(), 0, 1);
      return list.filter((c) => new Date(c.dateReception) >= s);
    }
    return list;
  }, []);

  const commandesFiltrees = useMemo(() => {
    let r = filtrerParDate([...commandes], filtreDate);
    if (filtreReference.trim()) {
      const t = filtreReference.toLowerCase();
      r = r.filter(
        (c) =>
          c.refPatient.toLowerCase().includes(t) ||
          c.typeAppareil?.toLowerCase().includes(t),
      );
    }
    if (filtreStatut) r = r.filter((c) => c.statut === filtreStatut);
    return r;
  }, [commandes, filtreDate, filtreReference, filtreStatut, filtrerParDate]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [filtreDate, filtreReference, filtreStatut]);

  const totalPages = Math.ceil(commandesFiltrees.length / COMMANDES_PAR_PAGE);
  const commandesCourantes = commandesFiltrees.slice(
    (currentPage - 1) * COMMANDES_PAR_PAGE,
    currentPage * COMMANDES_PAR_PAGE,
  );

  const clearFilters = useCallback(() => {
    setFiltreDate("TOUS");
    setFiltreReference("");
    setFiltreStatut("");
  }, []);

  const stats = useMemo(
    () => ({
      total: commandes.length,
      enAttente: commandes.filter((c) => c.statut === "EN_ATTENTE").length,
      enCours: commandes.filter((c) => c.statut === "EN_COURS").length,
      termine: commandes.filter(
        (c) => c.statut === "TERMINEE" || c.statut === "EXPEDIEE",
      ).length,
    }),
    [commandes],
  );

  const hasFilters = filtreReference || filtreDate !== "TOUS" || filtreStatut;

  return (
    <div className="cc-root">
      <button
        className="cc-mob-toggle"
        onClick={() => setMobileSidebar(!mobileSidebar)}
      >
        <SlidersHorizontal size={15} />
        Filtres{hasFilters && <span className="cc-dot" />}
      </button>

      <div className="cc-layout">
        <div className={`cc-sb-wrap${mobileSidebar ? " open" : ""}`}>
          <FilterSidebar
            search={filtreReference}
            filtreDate={filtreDate}
            filtreStatut={filtreStatut}
            onSearch={(e) => setFiltreReference(e.target.value)}
            onDate={(e) => setFiltreDate(e.target.value)}
            onStatut={setFiltreStatut}
            onClear={clearFilters}
            total={commandes.length}
            filtered={commandesFiltrees.length}
          />
        </div>
        {mobileSidebar && (
          <div
            className="cc-backdrop"
            onClick={() => setMobileSidebar(false)}
          />
        )}

        <div className="cc-main">
          {/* Stats bar */}
          {!loading && !error && commandes.length > 0 && (
            <div className="cc-stats-bar">
              <div className="cc-stat">
                <span className="cc-stat-n">{stats.total}</span>
                <span className="cc-stat-l">Total</span>
              </div>
              <div className="cc-stat-div" />
              <div className="cc-stat warning">
                <span className="cc-stat-n">{stats.enAttente}</span>
                <span className="cc-stat-l">En attente</span>
              </div>
              <div className="cc-stat primary">
                <span className="cc-stat-n">{stats.enCours}</span>
                <span className="cc-stat-l">En cours</span>
              </div>
              <div className="cc-stat success">
                <span className="cc-stat-n">{stats.termine}</span>
                <span className="cc-stat-l">Terminées</span>
              </div>
            </div>
          )}

          {loading ? (
            <div className="cc-state">
              <div className="cc-spinner" />
              <p>Chargement des commandes…</p>
            </div>
          ) : error ? (
            <div className="cc-state empty">
              <Package size={44} />
              <h3>Erreur de chargement</h3>
              <p>Impossible de charger les commandes.</p>
            </div>
          ) : commandesFiltrees.length === 0 ? (
            <div className="cc-state empty">
              <Package size={44} />
              <h3>Aucune commande</h3>
              <p>
                {hasFilters
                  ? "Aucune commande ne correspond à vos filtres."
                  : "Vous n'avez pas encore de commandes."}
              </p>
              {hasFilters && (
                <button className="cc-empty-reset" onClick={clearFilters}>
                  <X size={13} />
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="cc-grid">
                {commandesCourantes.map((c) => (
                  <CommandeCard key={c.id} commande={c} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="cc-pagination">
                  <button
                    className="cc-page-btn"
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={14} />
                    Préc.
                  </button>
                  <div className="cc-pages">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`cc-page-num${currentPage === page ? " active" : ""}`}
                        >
                          {page}
                        </button>
                      ),
                    )}
                  </div>
                  <button
                    className="cc-page-btn"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Suiv.
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandesCabinet;
