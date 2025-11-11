import { useContext, useEffect, useState } from "react";
import { CountriesContext } from "../CountriesContext";
import Modal from "../components/Modal";
import styles from "./Country.module.css";

export default function RegionPage({ region }) {
  const {
    allCountries,
    countries,
    setCountries,
    favorites,
    toggleFavorite,
    loading,
    error,
  } = useContext(CountriesContext);

  const [currentPage, setCurrentPage] = useState(1);
  const [countriesPerPage, setCountriesPerPage] = useState(10);

  // Update countries when region changes
  useEffect(() => {
    setCountries(allCountries.filter((c) => c.region === region));
  }, [allCountries, region, setCountries]);

  // Reset page when countries change
  useEffect(() => {
    setCurrentPage(1);
  }, [countries]);

  // Dynamic calculation of countries per page
  useEffect(() => {
    function updateCountriesPerPage() {
      // Total available height (minus some header or padding if needed)
      const headerHeight = 120; // adjust to your layout
      const availableHeight = window.innerHeight - headerHeight;

      // Height of a country card (including gap)
      const cardHeight = 230 + 32; // your card height + gap
      const perPage = Math.floor(availableHeight / cardHeight) * Math.floor(4); // optional: multiply by columns if you use grid
      setCountriesPerPage(Math.max(1, perPage));
    }

    updateCountriesPerPage();
    window.addEventListener("resize", updateCountriesPerPage);
    return () => window.removeEventListener("resize", updateCountriesPerPage);
  }, []);

  const lastCountryIndex = currentPage * countriesPerPage;
  const firstCountryIndex = lastCountryIndex - countriesPerPage;
  const currentCountries = countries.slice(firstCountryIndex, lastCountryIndex);
  const totalPages = Math.ceil(countries.length / countriesPerPage);

  const [selectedCountry, setSelectedCountry] = useState(null);
  const openModal = (country) => setSelectedCountry(country);
  const closeModal = () => setSelectedCountry(null);

  return (
    <div className={styles.countriesContainer}>
      {loading && <p>Loading...</p>}
      {error && <p>{error.message}</p>}

      {!loading && !error && (
        <>
          <ul className={styles.countryList}>
            {currentCountries.map((c) => (
              <li
                key={c.cca3}
                className={styles.country}
                onClick={() => openModal(c)}
              >
                <img
                  src={c.flags.png}
                  alt={c.name.common}
                  className={styles.flag}
                />
                <div className={styles.info}>
                  <h2>{c.name.common}</h2>
                  <p>
                    <strong>Capital:</strong> {c.capital?.[0] || "N/A"}
                  </p>
                  <p>
                    <strong>Region:</strong> {c.region}
                  </p>
                  <p>
                    <strong>Population:</strong>{" "}
                    {c.population?.toLocaleString() || "N/A"}
                  </p>
                </div>
                <label
                  htmlFor={`fav-${c.cca3}`}
                  className={styles.favoriteLbl}
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    className={styles.favoriteBtn}
                    id={`fav-${c.cca3}`}
                    checked={favorites.includes(c.cca3)}
                    onChange={() => toggleFavorite(c.cca3)}
                  />
                </label>
              </li>
            ))}
          </ul>

          {countries.length > countriesPerPage && (
            <div className={styles.pagination}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {selectedCountry && (
        <Modal onClose={closeModal}>
          <label
            htmlFor={`fav-modal-${selectedCountry.cca3}`}
            className={styles.favoriteLbl}
          >
            <input
              type="checkbox"
              className={styles.favoriteBtn}
              id={`fav-modal-${selectedCountry.cca3}`}
              checked={favorites.includes(selectedCountry.cca3)}
              onChange={() => toggleFavorite(selectedCountry.cca3)}
            />
          </label>
          <div className={styles.modalContent}>
            <div className={styles.flagAndName}>
              <img
                src={selectedCountry.flags.png}
                alt={selectedCountry.name.common}
                className={styles.flagModal}
                width={200}
              />
              <h2 className={styles.nameModal}>
                {selectedCountry.name.common}
              </h2>
            </div>
            <p>
              <strong>Capital: </strong>
              {selectedCountry.capital[0] || "N/A"}
            </p>
            <p>
              <strong>Region: </strong>
              {selectedCountry.region}
            </p>
            <p>
              <strong>Subregion: </strong>
              {selectedCountry.subregion || "N/A"}
            </p>
            <p>
              <strong>Population: </strong>{" "}
              {selectedCountry.population.toLocaleString() || "N/A"}
            </p>
            <p>
              <strong>Phone code: </strong>
              {selectedCountry.idd.root}
              {selectedCountry.idd.suffixes
                ? selectedCountry.idd.suffixes[0]
                : ""}
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
