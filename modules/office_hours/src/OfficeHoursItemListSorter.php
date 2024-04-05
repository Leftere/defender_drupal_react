<?php

namespace Drupal\office_hours;

use Drupal\office_hours\Plugin\Field\FieldType\OfficeHoursItem;
use Drupal\office_hours\Plugin\Field\FieldType\OfficeHoursItemListInterface;

/**
 * Generates a sorted ['date' => [$item]] list.
 */
class OfficeHoursItemListSorter {

  /**
   * An integer representing the next open day.
   *
   * @var \Drupal\office_hours\Plugin\Field\FieldType\OfficeHoursItemList
   */
  protected $itemList = NULL;

  /**
   * An integer representing the next open day.
   *
   * @var array
   */
  public $sortedItemList = [];

  /**
   * {@inheritdoc}
   */
  public function __construct(OfficeHoursItemListInterface $items) {
    $this->itemList = $items;
  }

  /**
   * Returns a sorted list of items, keyed by Date[day_index].
   */
  public function getSortedItemList(int $time): array {

    // Read the cache.
    if (isset($this->sortedItemList[$time])) {
      return $this->sortedItemList[$time];
    }

    $date = OfficeHoursDateHelper::format($time, 'Y-m-d');
    $yesterday = strtotime($date . ' -1 day');
    $today = strtotime($date);
    $seasons = $this->itemList->getSeasons(TRUE, FALSE, 'ascending', $yesterday);

    // Build a list of open next days. Then pick the first day.
    // This is needed instead of picking the open day directly,
    // since while processing the list, seasons might override weekdays,
    // and (closed) exception might override weekdays or season days.
    // At the end, we pick the first day of the list.
    $sorted_list = [];

    // Assume that all days are ordered on key = day number.
    $iterator = $this->itemList->getIterator();
    for ($iterator->rewind(); $iterator->valid(); $iterator->next()) {
      /** @var \Drupal\office_hours\Plugin\Field\FieldType\OfficeHoursItem $item */
      $item = $iterator->current();

      $slot = $item->getValue();
      $slot_weekday = $item->getWeekday();

      $season = $item->getSeason();
      $horizon = 14;
      $end_date = (strtotime($date . " +$horizon day"));

      // Determine the date.
      $slot_date = 0;
      switch (TRUE) {
        case $item->isSeasonHeader():
          break;

        case $item->isSeasonDay():
        case $item->isWeekDay():
          // The formatter filters past seasons.
          if (isset($seasons[$item->getSeasonId()])) {
            // Calculate 'next weekday after (day before) start of season'.
            $weekday = OfficeHoursDateHelper::weekDaysByFormat('long_untranslated', $slot_weekday);
            $start_season = strtotime("-1 day", max($today, $season->getFromDate()));
            $slot_date = strtotime(date("Y-m-d", strtotime("next $weekday", $start_season)));
            if ($slot_date == $yesterday && $item->isOpen($time)) {
              // Check if Yesterday has an open 'after midnight' time slot.
              $slot_date = $yesterday;
            }
          }
          break;

        case $item->isExceptionDay():
          $horizon = 366;
          $end_date = (strtotime($date . " +$horizon day"));
          $slot_date = $item->day;
          break;

      }

      // Filter on the valid seasons.
      if (!$slot_date) {
        continue;
      }

      // Remove previously set date (only at first day_index=0).
      // @todo We assume seasons are in correct order. Support reordering.
      $set_slot = $sorted_list[$slot_date][0] ?? NULL;
      if ($set_slot && $set_slot->day !== $item->day) {
        $this->removeItem($sorted_list, $slot_date);
      }

      // Process each slot.
      // Per date, unset closed days, or add an array of slots.
      // Exclude dates in the past and the far future.
      // Include yesterday, to get opening times after midnight.
      switch (TRUE) {

        case is_null($item):
          // Do nothing. Do not add to the list.
          break;

        case $item->isSeasonHeader():
          if ($season->isInRange($yesterday, $end_date)) {
            $season_startdate = OfficeHoursDateHelper::format(max($yesterday, $season->getFromDate()), 'Y-m-d');
            // For future seasons only, fill the upcoming empty dates,
            // overwriting weekdays (smaller day numbers).
            // The open days are already set by the other SeasonDays.
            for ($i = 0; $i < $horizon; $i++) {
              $slot_date = strtotime($season_startdate . " +$i day");
              if ($slot_date <= $season->getToDate()) {

                // Remove previously set date (only at first day_index=0).
                $set_slot = $sorted_list[$slot_date][0] ?? NULL;
                if ($set_slot && $set_slot->isWeekDay()) {
                  $this->removeItem($sorted_list, $slot_date);
                }
              }
            }
          }
          break;

        case $item->isSeasonDay():
        case $item->isExceptionDay():
          // Check if Yesterday has an open 'after midnight' time slot.
          if ($item->isInRange($yesterday, $yesterday)) {
            if ($item->isOpen($time)) {
              $this->addItem($sorted_list, $item, $slot_date);
            }
          }
          elseif ($item->isInRange($today, $end_date)) {
            $this->addItem($sorted_list, $item, $slot_date);
          }
          break;

        case $item->isWeekDay():
          $this->addItem($sorted_list, $item, $slot_date);
          break;

      }
    }

    // Sort items on date.
    ksort($sorted_list);
    $this->sortedItemList[$time] = $sorted_list;

    return $this->sortedItemList[$time];
  }

  /**
   * Adds an item to the list, or closes a date.
   *
   * @param mixed $sorted_list
   *   A reference to the list.
   * @param \Drupal\office_hours\Plugin\Field\FieldType\OfficeHoursItem|null $item
   *   The time slot to be added.
   * @param mixed $slot_date
   *   The date of the slot to work with.
   */
  protected function addItem(array &$sorted_list, OfficeHoursItem|NULL $item, int $slot_date) {
    if (!$item) {
      // No time slot given, clear the date.
      $sorted_list[$slot_date] = [];
    }
    elseif ($item->isEmpty()) {
      // Closed all day, clear the date.
      $sorted_list[$slot_date] = [];
    }
    else {
      // A valid time slot, add to the date.
      $sorted_list[$slot_date][] = $item;
    }
  }

  /**
   * Removes an item from the list.
   *
   * @param mixed $sorted_list
   *   A reference to the list.
   * @param mixed $slot_date
   *   The date of the slot to work with.
   */
  protected function removeItem(array &$sorted_list, int $slot_date) {
    $this->addItem($sorted_list, NULL, $slot_date);
  }

  /**
   * Gets NextDay.
   *
   * @param int $time
   *   A timestamp, representing a day-date.
   *
   * @return array
   *   The date's time slots: [date => [day_index => $item].
   */
  public function getNextDay(int $time): array {
    $sorted_list = $this->getSortedItemList($time);

    $date = OfficeHoursDateHelper::format($time, 'Y-m-d');
    $yesterday = strtotime($date . ' -1 day');
    $today = strtotime($date);

    // Pick the next/current open day number.
    // Assuming that previous days are already excluded from the list.
    $next_day = [];
    foreach ($sorted_list as $date => $day) {
      /** @var \Drupal\office_hours\Plugin\Field\FieldType\OfficeHoursItem $item */
      foreach ($day as $day_index => $item) {
        if ($item) {
          if ($date == $yesterday || $date == $today) {
            $status = $item->getStatus($time);
            if (in_array($status, [OfficeHoursItem::IS_OPEN, OfficeHoursItem::WILL_OPEN])) {
              // We are open or will open later today.
              return [$date => $day];
            }
          }
          elseif ($date > $yesterday) {
            return [$date => $day];
          }
        }
      }
    }
    return $next_day;
  }

}
