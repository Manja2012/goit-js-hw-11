import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Axios from 'axios';
import Notiflix from 'notiflix';

const gallery = document.querySelector(`.gallery`);
const form = document.querySelector(`.search-form`);
const loadMoreBtn = document.querySelector(`.load-more`);

form.addEventListener(`submit`, onSearchForm);
loadMoreBtn.addEventListener(`click`, loadMoreItems);

let page = 1;
let name = ``;
loadMoreBtn.style.display = `none`;


function onSearchForm(event) {
  cleanPage();
  event.preventDefault();
  name = event.currentTarget.elements.searchQuery.value.trim();

  if (!name) {
    Notiflix.Notify.warning(`Please choose the animal`);
  } else {
    fetchUrl(name, page);
  }
}


async function fetchUrl(searchRequest, page = 1) {
  try {
    const KEY = `29526037-011b39b59387f2f37ea2d4748`;
    const URL = `https://pixabay.com/api/`;

    const arrOfItems = await Axios.get(`${URL}`, {
      params: {
        key: `${KEY}`,
        q: `${searchRequest}`,
        image_type: `photo`,
        safesearch: `true`,
        orientation: `horizontal`,
        page: `${page}`,
        per_page: 40,
      },
    });

    console.log(arrOfItems);

    if (arrOfItems.data.totalHits > 0 && page === 1) {

      Notiflix.Notify.info(
        `Hooray! We found ${arrOfItems.data.totalHits} images.`
      );
    }

    if (arrOfItems.data.totalHits === 0) {
      Notiflix.Notify.failure(
        `Sorry, there are no images matching your search query. Please try again.`
      );
    }

    renderMarkUp(arrOfItems.data);

    new SimpleLightbox(`.gallery .photo-card`, {
      captionType: 'attr',
      captionsData: `alt`,
      captionDelay: 250,
    }).refresh();

  } catch (error) {
    Notiflix.Notify.warning(error);
  }
}

function renderMarkUp(arr) {
  const markUp = arr.hits.reduce((acc, hit) => {
    return (acc += `
    <div class="gallery__item" >
      <a class="photo-card" href="${hit.largeImageURL}">
        <img class="gallery__img" src="${hit.webformatURL}" alt="${hit.tags}" loading="lazy" />
      </a>
      <a class="info">
        <p class="info-item"> Likes:${hit.likes}</p>
        <p class="info-item">Views:${hit.views}</p>
        <p class="info-item">Comments:${hit.comments}</p>
        <p class="info-item">Downloads:${hit.downloads}</p>
      </a>
    </div>
    `);
  }, ``);

  gallery.innerHTML = '';

  gallery.innerHTML = markUp;

  if (arr.hits.length > 0) {
    loadMoreBtn.style.display = ``;
  }
  console.log(arr.hits);
  if ((Math.floor(arr.totalHits / 40) < page) && arr.hits.length !=0) {
    loadMoreBtn.style.display = 'none';
    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  }
}

function loadMoreItems() {
  fetchUrl(name, (page += 1));
}


function cleanPage() {
  loadMoreBtn.style.display = `none`;
  gallery.innerHTML = ``;
  page = 1;
}


