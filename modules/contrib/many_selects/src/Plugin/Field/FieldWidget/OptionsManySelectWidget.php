<?php

namespace Drupal\many_selects\Plugin\Field\FieldWidget;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\Plugin\Field\FieldWidget\OptionsSelectWidget;
use Drupal\Core\Field\WidgetInterface;
use Drupal\Core\Form\FormStateInterface;

/**
 * Plugin implementation of the 'options_select' widget.
 *
 * @FieldWidget(
 *   id = "many_options_select",
 *   label = @Translation("Many select list"),
 *   field_types = {
 *     "entity_reference",
 *     "list_integer",
 *     "list_float",
 *     "list_string"
 *   },
 * )
 */
class OptionsManySelectWidget extends OptionsSelectWidget implements
  WidgetInterface {

  /**
   * {@inheritdoc}
   */
  public function formElement(
    FieldItemListInterface $items,
    $delta,
    array $element,
    array &$form,
    FormStateInterface $form_state) {

    $element = parent::formElement(
      $items,
      $delta,
      $element,
      $form,
      $form_state
    );

    $element['#options'] = [
      '_none' => $this->getEmptyLabel(),
    ] + $this->getOptions($items->getEntity());

    $element[$this->column] = $element;
    $element[$this->column]['#default_value'] =
      empty($items[$delta]->{$this->column}) ?
        '_none' :
        $items[$delta]->{$this->column};

    $element[$this->column]['#multiple'] = FALSE;
    unset($element['#type']);

    return $element;
  }

  /**
   * {@inheritdoc}
   */
  public static function validateElement(
    array $element,
    FormStateInterface $form_state) {

    if ($element['#required'] && isset($element['#value']) && $element['#value'] === '_none') {
      $form_state->setError(
      $element,
      t(
        '@name field is required.',
        ['@name' => $element['#title']]
      )
      );
    }

    if (isset($element['#value']) && $element['#value'] === '_none') {
      $form_state->setValueForElement($element, NULL);
    }
  }

  /**
   * {@inheritdoc}
   */
  protected function getEmptyLabel() {
    return $this->t('@label', ['@label' => $this->getSetting('empty_label')]);
  }

  /**
   * {@inheritdoc}
   */
  public static function defaultSettings() {
    return [
      'empty_label' => '- None -',
    ] + parent::defaultSettings();
  }

  /**
   * {@inheritdoc}
   */
  public function settingsForm(array $form, FormStateInterface $form_state) {
    $element['empty_label'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Empty Label'),
      '#default_value' => $this->getSetting('empty_label') ?
      $this->getSetting('empty_label') :
      $this->t('- None -'),
      '#description' => $this->t(
        'Empty Label to be display, default " - None - ".'
      ),
    ];

    return $element;
  }

  /**
   * {@inheritdoc}
   */
  public function settingsSummary() {
    $summary = [];

    $summary[] = $this->t(
      'Empty Label: @empty_label',
      [
        '@empty_label' => $this->getSetting('empty_label') ?
        $this->getSetting('empty_label') :
        $this->t('- None -'),
      ]
    );

    return $summary;
  }

}
