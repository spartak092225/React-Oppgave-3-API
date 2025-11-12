import { useContext, useEffect, useState } from "react";
import { CountriesContext } from "../CountriesContext";
import Modal from "../components/Modal";
import styles from "./Country.module.css";

// HELPER FUNCTION: Calculates items per page based on window width
const getItemsPerPage = () => {
  const width = window.innerWidth;

  if (width <= 720) {
    return 6;
  }
  if (width <= 930) {
    return 9;
  }
  if (width <= 1150) {
    return 8;
  }
  if (width <= 1350) {
    return 10;
  }
  if (width <= 1600) {
    return 12;
  }
  return 24;
};

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
  const [countriesPerPage, setCountriesPerPage] = useState(getItemsPerPage());

  // Update countries when region changes
  useEffect(() => {
    setCountries(allCountries.filter((c) => c.region === region));
  }, [allCountries, region, setCountries]);

  // Reset page to 1 when countries list changes
  useEffect(() => {
    setCurrentPage(1);
  }, [countries]); // This is correct

  // Updates countriesPerPage when window is resized
  useEffect(() => {
    const handleResize = () => {
      setCountriesPerPage(getItemsPerPage());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- NEWLY ADDED: FIXES THE STALE PAGE BUG ---
  // This effect runs *after* countriesPerPage or countries list changes
  useEffect(() => {
    // Recalculate total pages based on the *new* state
    const newTotalPages = Math.ceil(countries.length / countriesPerPage);

    // If the list is empty, reset to page 1
    if (newTotalPages === 0) {
      setCurrentPage(1);
    }
    // If the current page is now invalid (greater than total pages)
    // reset it to the *last* valid page.
    else if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages);
    }
  }, [countriesPerPage, countries.length, currentPage]); // Re-run if these change

  // --- All your existing logic below this line is correct ---

  // These calculations now run *after* the state has been corrected
  const totalPages = Math.ceil(countries.length / countriesPerPage);
  const lastCountryIndex = currentPage * countriesPerPage;
  const firstCountryIndex = lastCountryIndex - countriesPerPage;
  const currentCountries = countries.slice(firstCountryIndex, lastCountryIndex);

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

          {/* This check is now robust */}
          {countries.length > countriesPerPage && (
            <div className={styles.pagination}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </button>
              <span>
                {/* Ensure totalPages isn't 0 */}
                Page {currentPage} of {totalPages || 1}
              </span>
              <button
                disabled={currentPage === totalPages || totalPages === 0}
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
