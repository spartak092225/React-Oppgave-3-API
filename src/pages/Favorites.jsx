import { useContext, useState, useEffect } from "react";
import { CountriesContext } from "../CountriesContext";
import Modal from "../components/Modal";
import styles from "./Country.module.css";

// HELPER FUNCTION: Calculates items per page based on window width

const getItemsPerPage = () => {
  const width = window.innerWidth;

  if (width <= 720) {
    return 10;
  }
  if (width <= 1150) {
    return 12;
  }
  if (width <= 1350) {
    return 15;
  }
  if (width <= 1600) {
    return 12;
  }
  return 27;
};

export default function Favorites() {
  const { allCountries, favorites, toggleFavorite } =
    useContext(CountriesContext);

  const [currentPage, setCurrentPage] = useState(1);
  const [favCountries, setFavCountries] = useState([]);
  // UPDATED: countriesPerPage is now dynamic state
  const [countriesPerPage, setCountriesPerPage] = useState(getItemsPerPage());
  const [selectedCountry, setSelectedCountry] = useState(null);

  // 1. Logic to filter and update favorite countries list
  // Also resets the page to 1 whenever favorites change.
  useEffect(() => {
    const favs = allCountries.filter((c) => favorites.includes(c.cca3));
    setFavCountries(favs);
    // setCurrentPage(1); // Removed this, will use a dedicated useEffect below for better sync
  }, [allCountries, favorites]);

  // NEW: Updates countriesPerPage when window is resized
  useEffect(() => {
    const handleResize = () => {
      setCountriesPerPage(getItemsPerPage());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // NEW: Fixes the stale page bug and resets page when favorites change
  // We watch the length of the list AND the page size
  useEffect(() => {
    // If the favorites array is filtered (i.e., user added/removed one), recalculate and ensure page is valid.
    const newTotalPages = Math.ceil(favCountries.length / countriesPerPage);

    // If the list is empty or changes radically, reset to page 1
    if (newTotalPages === 0 || currentPage === 1) {
      setCurrentPage(1);
    }
    // If the current page is now invalid (greater than total pages)
    else if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages); // Set to last valid page
    }
  }, [countriesPerPage, favCountries.length, currentPage]);

  // Pagination calculations (Use the state values)
  const totalPages = Math.ceil(favCountries.length / countriesPerPage);
  const lastCountryIndex = currentPage * countriesPerPage;
  const firstCountryIndex = lastCountryIndex - countriesPerPage;
  const currentCountries = favCountries.slice(
    firstCountryIndex,
    lastCountryIndex
  );

  const openModal = (country) => {
    setSelectedCountry(country);
  };

  const closeModal = () => {
    setSelectedCountry(null);
  };

  return (
    <div className={styles.countriesContainer}>
      {currentCountries.length === 0 ? (
        <p>No favorite countries yet.</p>
      ) : (
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
                  <p className={styles.capital}>
                    <strong>Capital:</strong> {c.capital?.[0] || "N/A"}
                  </p>
                  <p className={styles.region}>
                    <strong>Region:</strong> {c.region}
                  </p>
                  <p className={styles.population}>
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

          {favCountries.length > countriesPerPage && (
            <div className={styles.pagination}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </button>
              <span>
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
              {selectedCountry.population?.toLocaleString() || "N/A"}
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
