// test.spec.js

describe('FX Empire Website Test Suite', () => {
  // Selectors using data attributes for better stability
  const selectors = {
    hamburgerMenu: '[data-name="hamburger menu"]',
    navMenu: 'nav#nav-menu',
    searchInput: '[data-name="main search"]',
    searchResults: '[data-cy="desktop-search-drop-down"]',
    featuredArticles: 'div.sc-6c6cbb46-5', // Consider recommending data-test-id instead
    mainContent: 'div#__next',
    loadingIndicator: '[data-cy="loading-indicator"]',
    marketLink: 'a[href="/markets"]',
    cryptoLink: 'a[href="/crypto"]',
    newsLink: 'a[href="/news"]',
    forecastsLink: 'a[href="/forecasts"]',
    brokersLink: 'a[href="/brokers"]',
    articleCards: '[data-name^="hp_article_"]'
  };

  const testData = {
    menuItems: [
      { href: '/markets', text: 'Markets' },
      { href: '/crypto', text: 'Crypto' },
      { href: '/news', text: 'News' },
      { href: '/forecasts', text: 'Forecasts' },
      { href: '/brokers', text: 'Forex Brokers' },
      { href: '/tools', text: 'Calendars' },
      { href: '/macro', text: 'Macro Data' },
      { href: '/about-us', text: 'About us' }
    ],
    searchTerms: {
      valid: 'Bitcoin',
      invalid: 'InvalidTerm'
    },
    apiEndpoints: {
      articles: 'https://fxempire.com/api/v1/en/articles/latest/top-articles-homepage'
    }
  };
  // Reusable functions with proper error handling
  const navigateTo = (selector, expectedPath) => {
    cy.log(`Navigating to ${expectedPath}`);
    try {
      cy.get(selector, { timeout: 10000 })
        .should('be.visible')
        .first()
        .click();
      cy.url().should('include', expectedPath);
      cy.log(`Successfully navigated to ${expectedPath}`);
    } catch (error) {
      cy.log(`Error navigating to ${expectedPath}: ${error.message}`);
      throw error;
    }
    return cy.wrap({});
  };

  const performSearch = (searchTerm) => {
    cy.log(`Performing search for: ${searchTerm}`);
    try {
      cy.get(selectors.searchInput, { timeout: 10000 })
        .should('be.enabled')
        .clear()
        .type(`${searchTerm}{enter}`, { force: true });
      cy.log(`Search submitted for term: ${searchTerm}`);
    } catch (error) {
      cy.log(`Error performing search for ${searchTerm}: ${error.message}`);
      throw error;
    }
    return cy.wrap({});
  };

  const getSearchResults = () => {
    cy.log('Getting search results');
    try {
      return cy.get(selectors.searchResults, { timeout: 15000 })
        .should('be.visible');
    } catch (error) {
      cy.log(`Error getting search results: ${error.message}`);
      throw error;
    }
  };

  const openHamburgerMenu = () => {
    cy.log('Opening hamburger menu');
    try {
      cy.get(selectors.hamburgerMenu, { timeout: 10000 })
        .should('be.visible')
        .click();
      cy.log('Hamburger menu opened successfully');
    } catch (error) {
      cy.log(`Error opening hamburger menu: ${error.message}`);
      throw error;
    }
    return cy.wrap({});
  };

  beforeEach(() => {
    cy.log(`Starting new test case: ${Cypress.currentTest.title}`);

    try {
      // Visit with base url
      cy.visit('/');

      // Wait for main content to be visible
      cy.log('Waiting for page load');
      cy.get(selectors.mainContent, { timeout: 20000 }).should('be.visible');
      cy.log('Page loaded successfully');

    } catch (error) {
      cy.log(`Error during page setup: ${error.message}`);
      throw error;
    }
  });

  afterEach(() => {
    cy.log(`Test case completed:  ${Cypress.currentTest.title}`);
  });

  describe('Navigation Tests', () => {
    it('should verify navigation menu presence and items', () => {
      cy.log('Testing navigation menu structure');

      try {
        // Open hamburger menu to access navigation
        openHamburgerMenu();

        // Verify navigation menu exists
        cy.get(selectors.navMenu, { timeout: 10000 })
          .should('exist');

        // Verify each menu item exists and is visible
        testData.menuItems.forEach(item => {
          cy.get(`${selectors.navMenu} a[href*="${item.href}"]`, { timeout: 10000 })
            .should('exist')
            .and('be.visible')
            .and('contain', item.text);
          cy.log(`Verified menu item: ${item.text}`);
        });
      } catch (error) {
        cy.log(`Error in navigation menu test: ${error.message}`);
        throw error;
      }
    });

    it('should verify navigation functionality', () => {
      try {
        // Test navigation to Markets
        openHamburgerMenu();
        navigateTo(selectors.marketLink, '/markets');

        // Go back to home page
        cy.go('back');
        cy.get(selectors.mainContent, { timeout: 10000 }).should('be.visible');
        cy.log('Successfully navigated back to homepage');

        // Test navigation to Crypto
        openHamburgerMenu();
        navigateTo(selectors.cryptoLink, '/crypto');

        // Validate correct URL
        cy.url().should('include', '/crypto');
      } catch (error) {
        cy.log(`Error in navigation functionality test: ${error.message}`);
        throw error;
      }
    });
  });

  describe('Search Tests', () => {
    it('should perform search and validate results', () => {
      cy.log('Testing search functionality with valid term');

      try {
        const searchTerm = testData.searchTerms.valid;

        // Perform search
        performSearch(searchTerm);

        // Validate search results
        getSearchResults()
          .should('be.visible')
          .and('contain', searchTerm);

        cy.log('Search results validated successfully');
      } catch (error) {
        cy.log(`Error in search functionality test: ${error.message}`);
        throw error;
      }
    });

    it('should handle invalid search terms', () => {
      cy.log('Testing search functionality with invalid term');

      try {
        const invalidTerm = testData.searchTerms.invalid;

        // Perform search with invalid term
        performSearch(invalidTerm);

        // Validate error message in search results
        getSearchResults()
          .should('be.visible')
          .and('contain', 'No matching instruments');

        cy.log('Invalid search term handling validated');
      } catch (error) {
        cy.log(`Error in invalid search term test: ${error.message}`);
        throw error;
      }
    });
  });

  describe('API and UI Integration Tests', () => {
    it('should validate the API response and match with the homepage data', () => {
        // First visit the homepage to ensure content is loaded
        cy.visit('https://fxempire.com');

        // Send a GET request to the API
        cy.request('https://fxempire.com/api/v1/en/articles/latest/top-articles-homepage')
            .then((response) => {
                // Verify the response is successful (status 200)
                expect(response.status).to.eq(200);

                // Log the full response body for debugging
                cy.log('API Response:', JSON.stringify(response.body));

                // Validate each article has required properties
                response.body.forEach((article, index) => {
                    cy.log(`Validating article ${index + 1}:`, JSON.stringify(article));

                    // Validate required properties
                    expect(article).to.have.property('id');
                    expect(article).to.have.property('title');
                    //in the assigment is (url) 
                    expect(article).to.have.property('articleLink');
                    //in the assigment is ('publishedAt')
                    expect(article).to.have.property('publishedDate');
                });


                // Store API data for UI comparison
                const apiArticles = response.body;

                // Compare API data with homepage content
                cy.get('[data-name^="hp_article_"]').each(($el, index) => {
                    if (index < apiArticles.length) {
                        const apiTitle = apiArticles[index].title;
                        const homepageTitle = $el.find('span').text().trim();

                        // Log both titles for comparison
                        cy.log('Comparing titles:');
                        cy.log(`API title: ${apiTitle}`);
                        cy.log(`UI title: ${homepageTitle}`);
                        expect(homepageTitle).to.equal(apiTitle);

                        // Check if titles match or if UI title contains API title
                        if (apiTitle !== homepageTitle) {
                            // Log detailed mismatch information
                            cy.log('Title Mismatch Details:');
                            cy.log(`Index: ${index}`);
                            cy.log(`API Title: ${apiTitle}`);
                            cy.log(`Homepage Title: ${homepageTitle}`);
                            cy.log(`API Article Link: ${apiArticles[index].articleLink}`);

                            // Optional: You can make this a soft assertion
                            expect(homepageTitle).to.include(apiTitle);

                        }
                    }

                });
                // Validate minimum number of articles
                expect(response.body).to.have.length.of.at.least(5);

            });
    });
});

  describe('Dynamic Content Tests', () => {
    it('should handle dynamic content loading', () => {
      cy.log('Testing dynamic content loading');

      try {
        // Intercept API calls for dynamically loaded content
        cy.intercept('GET', '**/api/**').as('dynamicContentAPI');

        // Throttle network to test behavior under slow connections
        // Note: Requires Cypress experimentalNetworkStubbing: true in cypress.config.js
        if (Cypress.env('throttleNetwork')) {
          cy.log('Throttling network to slow 3G');
          cy.throttleNetwork('slow3g');
        }

        // Scroll to force lazy loading
        cy.scrollTo('bottom', { duration: 1000 });

        // Wait for loading indicator if it appears
        cy.get('body').then($body => {
          if ($body.find(selectors.loadingIndicator).length > 0) {
            cy.get(selectors.loadingIndicator, { timeout: 10000 }).should('be.visible');
            cy.log('Loading indicator appeared');
            cy.get(selectors.loadingIndicator, { timeout: 30000 }).should('not.exist');
            cy.log('Loading completed');
          } else {
            cy.log('No loading indicator found, waiting for network request');
            cy.wait('@dynamicContentAPI', { timeout: 30000 });
          }
        });

        // Verify featured articles loaded
        cy.get(selectors.featuredArticles, { timeout: 15000 })
          .should('have.length.greaterThan', 0)
          .debug();

        cy.log('Featured articles loaded successfully');

        // Reset network throttling if it was enabled
        if (Cypress.env('throttleNetwork')) {
          cy.log('Resetting network to online');
          cy.throttleNetwork('online');
        }
      } catch (error) {
        cy.log(`Error in dynamic content test: ${error.message}`);
        throw error;
      }
    });
  });

  // ADDITIONAL IMPROVED TEST: Resilient Component Testing
  describe('Resilient Component Tests', () => {
    it('should test components with improved resilience', () => {
      cy.log('Testing components with improved resilience');

      try {
        // Intercept all network requests to ensure stability
        cy.intercept('GET', '**/api/**').as('allAPICalls');

        // Define a retry utility for unstable elements
        const retryGetElement = (selector, options = {}) => {
          const { timeout = 15000, retries = 3, delay = 1000 } = options;

          return cy.wrap(null).then(() => {
            let attempts = 0;

            const attempt = () => {
              attempts++;
              cy.log(`Attempt ${attempts} to get element: ${selector}`);

              return cy.get('body').then($body => {
                if ($body.find(selector).length > 0) {
                  return cy.get(selector, { timeout });
                } else if (attempts < retries) {
                  cy.wait(delay);
                  return attempt();
                } else {
                  throw new Error(`Element ${selector} not found after ${retries} attempts`);
                }
              });
            };

            return attempt();
          });
        };

        // Test featured articles section with retry mechanism
        retryGetElement(selectors.featuredArticles, { retries: 3 })
          .should('exist')
          .then($articles => {
            cy.log(`Found ${$articles.length} featured articles`);
            expect($articles.length).to.be.greaterThan(0);
          });

        // Test that article clicks navigate correctly
        cy.get(selectors.articleCards).first().then($firstArticle => {
          const href = $firstArticle.prop('href');
          if (href) {
            const articleTitle = $firstArticle.find('span').text().trim();
            cy.log(`Testing navigation to article: ${articleTitle}`);

            cy.get(selectors.articleCards).first().click({force:true});

            // Verify navigation to article page
            cy.url().should('include', `${href}`);
            cy.get('h1').should('exist');
          } else {
            cy.log('Article link not found, skipping navigation test');
          }
        });
      } catch (error) {
        cy.log(`Error in resilient component test: ${error.message}`);
        throw error;
      }
    });
  });
});