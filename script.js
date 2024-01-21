// Add your JavaScript code here
document.addEventListener("DOMContentLoaded", (event) => {
  console.log("DOM is ready.");
});

const API_BASE_URL = "https://api.github.com/";
let TOTAL_REPOS = 0;

const searchInput = document.querySelector("#search");
const searchButton = document.querySelector("#search-btn");

const limitSelect = document.querySelector("#limit");
const sortSelect = document.querySelector("#sort");

[limitSelect, sortSelect].forEach((select) => {
  select.addEventListener("change", () => {
    updateRepos();
  });
});

const prevButton = document.querySelector("#prev-btn");
const nextButton = document.querySelector("#next-btn");

prevButton.addEventListener("click", () => {
  const pageNumberActive = document.querySelector(".pagination-btn.active");
  let pageNumber = parseInt(pageNumberActive.textContent);
  if (pageNumber > 1) {
    updateRepos(pageNumber - 1);
  }
});

nextButton.addEventListener("click", () => {
  const pageNumberActive = document.querySelector(".pagination-btn.active");
  let pageNumber = parseInt(pageNumberActive.textContent);
  updateRepos(pageNumber + 1);
});

// Event listeners

searchButton.addEventListener("click", () => {
  updateUserInfo();
});
searchInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    updateUserInfo();
  }
});

async function updateUserInfo() {
  const user_id = searchInput.value;
  const response = await fetch(`${API_BASE_URL}users/${user_id}`);
  const data = await response.json();

  // Alert and return in case
  if (response.status !== 200) {
    alert(data.message);
    return;
  }

  TOTAL_REPOS = data.public_repos;

  console.log(data);

  const userImage = document.querySelector("#user-image");
  const userName = document.querySelector("#user-name");
  const userBio = document.querySelector("#user-bio");
  const userFollowers = document.querySelector("#user-followers-count");
  const userFollowing = document.querySelector("#user-following-count");
  const userLocation = document.querySelector("#user-location");
  const userGithubLink = document.querySelector("#user-github-link");
  const userRepos = document.querySelector("#user-repos-count");

  userImage.src = data.avatar_url;
  userImage.alt = data.login;
  userName.textContent = data.name || "Not Available";
  userBio.textContent = data.bio || "Not Available";
  userFollowers.textContent = data.followers;
  userFollowing.textContent = data.following;
  userLocation.textContent = data.location || "Not Available";
  userGithubLink.href = data.html_url;
  userRepos.textContent = data.public_repos;

  updateRepos();
}

async function updateRepos(pageNumber = 1) {
  let limit = limitSelect.value;
  let sort = sortSelect.value;
  let params = `?per_page=${limit}&page=${pageNumber}&sort=${sort}`;
  let user_id = searchInput.value;
  let response = await fetch(`${API_BASE_URL}users/${user_id}/repos${params}`);
  let data = await response.json();

  if (response.status !== 200) {
    alert(data.message);
    return;
  }

  console.log(data);

  const reposList = document.querySelector(".repos-list");
  reposList.innerHTML = "";
  data.forEach((repo) => {
    const repoItem = document.createElement("li");
    repoItem.textContent = repo.name;
    reposList.appendChild(repoItem);
  });
  updatePagination(pageNumber, Math.ceil(TOTAL_REPOS / limit));
}

function updatePagination(currentPage, totalPages) {
  let pageNumbersWrapper = document.querySelector(".page-numbers-wrapper");

  // Clear the existing page numbers
  pageNumbersWrapper.innerHTML = "";

  // Add the page numbers
  for (let i = 1; i <= totalPages; i++) {
    // If there are too many pages, only show the first page, the last page, the current page, two pages before and after the current page, and ellipses
    if (
      totalPages > 7 &&
      (i < currentPage - 2 || i > currentPage + 2) &&
      i !== 1 &&
      i !== totalPages
    ) {
      if (i === currentPage - 3 || i === currentPage + 3) {
        pageNumbersWrapper.appendChild(document.createTextNode("..."));
      }
      continue;
    }

    let pageBtn = document.createElement("button");
    pageBtn.className = "pagination-btn";
    if (i === currentPage) {
      pageBtn.className += " active";
    }
    pageBtn.textContent = i;
    pageBtn.onclick = function () {
      updateRepos(i);
    };
    pageNumbersWrapper.appendChild(pageBtn);
  }
  enableDisableButtons(currentPage);
}

// Function to enable or disable next and prev buttons
// based on page number and repo count
function enableDisableButtons(pageNumber) {
  const totalPages = Math.ceil(TOTAL_REPOS / limitSelect.value);
  prevButton.disabled = pageNumber === 1;
  nextButton.disabled = pageNumber === totalPages;
}

// Initial load

updateUserInfo();
updateRepos();
