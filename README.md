# scDate

**Date and time library for dealing with schedules.**

[![github license](https://img.shields.io/github/license/ericvera/scdate.svg?style=flat-square)](https://github.com/ericvera/scdate/blob/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/scdate.svg?style=flat-square)](https://npmjs.org/package/scdate)

Features:

- Supports dates, times, time stamps, and active weekdays
- Time zone required for operations only when relevant
- Serializable to simple ISO formatted strings

## Dependencies

This package has the following dependencies:

- `date-fns-tz`: used for time zone calculations
- `date-fns`: it is a peer dependency of `date-fns-tz`
- `@date-fns/utc`: used for its `UTCDateMini` implementation that simplifies some of the time calculations

## Design Decisions

### ISO formatted values

A subset of [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) is used as the valid format for SDate, STime, and STimestamp. This was done because:

- the format is human readable
- the values are easily sortable as strings
- the values are easily comparable as strings

### No seconds in time components

The library was designed with schedules in mind that do not require second or smaller granularity as such STime and STimestamp only provide minute granularity.

## Time zones

For a list of valid time zones run `Intl.supportedValuesOf('timeZone')` in your environment.

## API Reference

See [docs](docs/README.md)
