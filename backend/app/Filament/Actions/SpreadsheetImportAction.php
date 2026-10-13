<?php

namespace App\Filament\Actions;

use DateTimeInterface;
use Filament\Actions\Action;
use Filament\Actions\ImportAction;
use Filament\Actions\Imports\ImportColumn;
use Filament\Forms\Components\FileUpload;
use Illuminate\Support\HtmlString;
use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Common\Entity\Style\Style;
use OpenSpout\Reader\XLSX\Reader as XlsxReader;
use OpenSpout\Writer\XLSX\Writer as XlsxWriter;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Throwable;

/**
 * Filament's import, for CSV or Excel (.xlsx) files. An Excel file's first sheet is turned into CSV
 * when it is read, so Filament's mapping, validation and queued import work unchanged. Adds an
 * « exemple Excel » download beside Filament's example CSV (same columns and example rows).
 * Old binary .xls files are not readable: save them as .xlsx (or CSV) first.
 */
class SpreadsheetImportAction extends ImportAction
{
    private const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    private const CSV_MIMES = [
        'text/csv', 'text/x-csv', 'application/csv', 'application/x-csv', 'text/comma-separated-values',
        'text/x-comma-separated-values', 'text/plain', 'application/vnd.ms-excel',
    ];

    protected function setUp(): void
    {
        parent::setUp();

        // Same modal as Filament's, with .xlsx accepted by the file field.
        $schema = $this->schema;
        $this->schema(function (ImportAction $action) use ($schema): array {
            $components = (array) $action->evaluate($schema);
            foreach ($components as $component) {
                if ($component instanceof FileUpload && $component->getName() === 'file') {
                    $component
                        ->label('Fichier CSV ou Excel (.xlsx)')
                        ->acceptedFileTypes([...self::CSV_MIMES, self::XLSX_MIME, 'application/zip', 'application/octet-stream']);
                }
            }

            return $components;
        });

        $this->registerModalActions([
            Action::make('downloadExampleXlsx')
                ->label('Télécharger un exemple Excel')
                ->link()
                ->action(fn (): BinaryFileResponse => $this->exampleXlsx()),
        ]);

        // Both example files under the heading (Filament escapes plain strings: pass rendered HTML).
        $this->modalDescription(fn (ImportAction $action): HtmlString => new HtmlString(view('filament.actions.import-examples', [
            'csv' => $action->getModalAction('downloadExample'),
            'xlsx' => $action->getModalAction('downloadExampleXlsx'),
        ])->render()));
    }

    /** @return array<mixed> */
    public function getFileValidationRules(): array
    {
        return array_map(
            fn ($rule) => $rule === 'extensions:csv,txt' ? 'extensions:csv,txt,xlsx' : $rule,
            parent::getFileValidationRules(),
        );
    }

    /** @return resource | false */
    public function getUploadedFileStream(TemporaryUploadedFile $file)
    {
        if (strtolower($file->getClientOriginalExtension() ?: $file->getExtension()) !== 'xlsx') {
            return parent::getUploadedFileStream($file);
        }

        return self::xlsxToCsvStream($file->getRealPath());
    }

    /**
     * The first sheet of an Excel file as a CSV stream (UTF-8, comma-separated). Whole numbers stay
     * whole (no « 612345678.0 »), dates become YYYY-MM-DD.
     *
     * @return resource | false
     */
    public static function xlsxToCsvStream(string $path)
    {
        $stream = fopen('php://temp', 'w+');
        if ($stream === false) {
            return false;
        }

        $reader = new XlsxReader;
        try {
            $reader->open($path);
            foreach ($reader->getSheetIterator() as $sheet) {
                foreach ($sheet->getRowIterator() as $row) {
                    $values = array_map(self::cellToString(...), $row->toArray());
                    if (array_filter($values, fn (string $v) => $v !== '') === []) {
                        continue; // blank row
                    }
                    fputcsv($stream, $values, escape: '');
                }
                break; // first sheet only
            }
        } catch (Throwable) {
            fclose($stream);

            return false;
        } finally {
            $reader->close();
        }

        rewind($stream);

        return $stream;
    }

    private static function cellToString(mixed $value): string
    {
        return match (true) {
            $value instanceof DateTimeInterface => $value->format('Y-m-d'),
            is_float($value) && floor($value) === $value && abs($value) < 1e15 => (string) (int) $value,
            is_bool($value) => $value ? '1' : '0',
            default => trim((string) $value),
        };
    }

    /** Example file: the importer's column headers and example rows, every cell formatted as text. */
    protected function exampleXlsx(): BinaryFileResponse
    {
        $columns = $this->getImporter()::getColumns();
        $examples = array_map(fn (ImportColumn $column): array => $column->getExamples(), $columns);
        $rowCount = max([0, ...array_map('count', $examples)]);

        $path = tempnam(sys_get_temp_dir(), 'import-example-').'.xlsx';
        $writer = new XlsxWriter;
        $writer->openToFile($path);
        $writer->addRow(Row::fromValues(
            array_map(fn (ImportColumn $column): string => $column->getExampleHeader(), $columns),
            (new Style)->setFontBold(),
        ));
        // Text format: phone numbers and ICE keep their leading zeros when the owner edits the file.
        $text = (new Style)->setFormat('@');
        for ($i = 0; $i < $rowCount; $i++) {
            $writer->addRow(Row::fromValues(array_map(fn (array $values): string => (string) ($values[$i] ?? ''), $examples), $text));
        }
        $writer->close();

        $name = (string) str($this->getImporter())->classBasename()->kebab()->append('-exemple.xlsx');

        return response()->download($path, $name, ['Content-Type' => self::XLSX_MIME])->deleteFileAfterSend();
    }
}
