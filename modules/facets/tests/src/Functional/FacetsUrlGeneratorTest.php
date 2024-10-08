<?php

namespace Drupal\Tests\facets\Functional;

use Drupal\facets\Entity\Facet;
use Symfony\Component\HttpFoundation\Request;

/**
 * Provides the Facets Url Generator test.
 *
 * @group facets
 */
class FacetsUrlGeneratorTest extends FacetsTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'facets',
    'facets_search_api_dependency',
    'facets_query_processor',
    'search_api',
    'search_api_db',
    'search_api_test_db',
    'search_api_test_example_content',
    'views',
    'rest',
    'serialization',
  ];

  /**
   * The FacetsUrlGenerator service.
   *
   * @var \Drupal\facets\Utility\FacetsUrlGenerator
   */
  protected $urlGenerator;

  /**
   * {@inheritdoc}
   */
  public function setUp(): void {
    parent::setUp();
    $this->urlGenerator = \Drupal::service('facets.utility.url_generator');

    $this->setUpExampleStructure();
    $this->insertExampleContent();
    $this->assertEquals(5, $this->indexItems($this->indexId), '5 items were indexed.');
  }

  /**
   * Create url.
   */
  public function testCreateUrl() {
    /** @var \Drupal\facets\FacetInterface $entity */
    $entity = Facet::create([
      'id' => 'test_facet',
      'name' => 'Test facet',
    ]);
    $entity->setWidget('links');
    $entity->setEmptyBehavior(['behavior' => 'none']);
    $entity->setUrlAlias('owl');
    $entity->setFacetSourceId('search_api:views_page__search_api_test_view__page_1');
    $entity->save();

    $url = $this->urlGenerator->getUrl(['test_facet' => ['fuzzy']]);

    $this->assertEquals('route:view.search_api_test_view.page_1;arg_0&arg_1&arg_2&view_id=search_api_test_view&display_id=page_1?f%5B0%5D=owl%3Afuzzy', $url->toUriString());

    // Setup search page URL with contextual parameters as current request and
    // path.
    $path = '/search-api-test-fulltext/entity:entity_test_mulrev_changed/entity_test_mulrev_changed';
    $request = Request::create($path);
    $result = \Drupal::service('router.no_access_checks')->matchRequest($request);
    $request->attributes->add($result);
    \Drupal::requestStack()->push($request);
    \Drupal::service('path.current')->setPath($path);
    $url = $this->urlGenerator->getUrl(['test_facet' => ['fuzzy']]);

    $this->assertEquals('route:view.search_api_test_view.page_1;arg_0=entity%3Aentity_test_mulrev_changed&arg_1=entity_test_mulrev_changed&arg_2&view_id=search_api_test_view&display_id=page_1?f%5B0%5D=owl%3Afuzzy', $url->toUriString());
    \Drupal::requestStack()->pop();
  }

  /**
   * Create url with already set facet.
   */
  public function testWithAlreadySetFacet() {
    $this->drupalPlaceBlock('display_generated_link');
    $this->createFacet('Owl', 'owl');
    $this->createFacet('Llama', 'llama', 'keywords');

    $facet = Facet::load('owl');
    $facet->setUrlAlias('donkey');
    $facet->save();

    $url = $this->urlGenerator->getUrl(['owl' => ['foo']]);
    $this->assertEquals('route:view.search_api_test_view.page_1;arg_0&arg_1&arg_2&view_id=search_api_test_view&display_id=page_1?f%5B0%5D=donkey%3Afoo', $url->toUriString());

    // This won't work without it being in the request, so we need to do this
    // from a block. We first click the link, check that the "orange" facet is
    // active as expected and that the output from the custom block is shown.
    // Then we click the item from the custom block and check that the orange is
    // no longer active, but item is.
    $this->drupalGet('search-api-test-fulltext');
    $this->clickLink('orange');
    $this->checkFacetIsActive('orange');
    $this->checkFacetIsNotActive('item');
    $this->assertSession()->pageTextContains('Link to owl item');
    $this->clickLink('Link to owl item');
    $this->checkFacetIsActive('item');
    $this->checkFacetIsNotActive('orange');

    // This won't work without it being in the request, so we need to do this
    // from a block. We first click the link, check that the "orange" facet is
    // active as expected and that the output from the custom block is shown.
    // Then we click the item from the custom block and check that the orange is
    // still active, but item is.
    \Drupal::state()->get('facets_url_generator_keep_active', TRUE);
    $this->drupalGet('search-api-test-fulltext');
    $this->clickLink('orange');
    $this->checkFacetIsActive('orange');
    $this->checkFacetIsNotActive('item');
    $this->assertSession()->pageTextContains('Link to owl item');
    $this->clickLink('Link to owl item');
    $this->checkFacetIsActive('item');
    $this->checkFacetIsActive('orange');
  }

}
