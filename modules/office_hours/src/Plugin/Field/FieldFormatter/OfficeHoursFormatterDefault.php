<?php

namespace Drupal\office_hours\Plugin\Field\FieldFormatter;

use Drupal\Component\Utility\SortArray;
use Drupal\Component\Utility\Xss;
use Drupal\Core\Field\FieldItemListInterface;

/**
 * Plugin implementation of the formatter.
 *
 * @FieldFormatter(
 *   id = "office_hours",
 *   label = @Translation("Plain text"),
 *   field_types = {
 *     "office_hours",
 *   },
 * )
 */
class OfficeHoursFormatterDefault extends OfficeHoursFormatterBase {

  /**
   * {@inheritdoc}
   */
  public function settingsSummary() {
    $summary = parent::settingsSummary();

    if (static::class === __CLASS__) {
      // Avoids message when class overridden. Parent repeats it when needed.
      $summary[] = '(When using multiple slots per day, better use the table formatter.)';
    }

    return $summary;
  }

  /**
   * {@inheritdoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode) {
    $elements = parent::viewElements($items, $langcode);

    // If no data is filled for this entity, do not show the formatter.
    if ($items->isEmpty()) {
      return $elements;
    }

    $formatter_settings = $this->getSettings();
    $widget_settings = $this->getFieldSettings();
    $third_party_settings = $this->getThirdPartySettings();
    // N.B. 'Show current day' may return nothing in getRows(),
    // while other days are filled.
    /** @var \Drupal\office_hours\Plugin\Field\FieldType\OfficeHoursItemListInterface $items */
    $office_hours = $items->getRows($formatter_settings, $widget_settings, $third_party_settings, 0, $this);
    $elements[] = [
      '#theme' => 'office_hours',
      '#parent' => $items->getFieldDefinition(),
      '#weight' => 10,
      // Pass filtered office_hours structures to twig theming.
      '#office_hours' => $office_hours,
      // Pass (unfiltered) office_hours items to twig theming.
      '#office_hours_field' => $items,
      // Pass formatting options to twig theming.
      '#is_open' => $items->isOpen(),
      '#item_separator' => Xss::filter(
        $formatter_settings['separator']['days'], ['br', 'hr', 'span', 'div']
      ),
      '#slot_separator' => $formatter_settings['separator']['more_hours'],
      '#attributes' => [
        'class' => ['office-hours'],
      ],
      // '#empty' => $this->t('This location has no opening hours.'),
      '#attached' => [
        'library' => [
          'office_hours/office_hours_formatter',
        ],
      ],
    ];

    $elements = $this->attachSchemaFormatter($items, $langcode, $elements);
    $elements = $this->attachStatusFormatter($items, $langcode, $elements);
    // Sort elements, to have Statusformattor on correct position.
    usort($elements, [SortArray::class, 'sortByWeightProperty']);

    if ($this->attachCache) {
      // Since Field cache does not work properly for Anonymous users,
      // .. enable dynamic field update in office_hours_status_update.js.
      // .. add a ['#cache']['max-age'] attribute to $elements.
      $elements += $this->attachCacheData($items, $langcode);
    }

    return $elements;
  }

}
